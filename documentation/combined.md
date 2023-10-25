
# Attestations

## Overview

Attestations are statements made by an issuer about a subject.  The subject can be an EVM address, or a DID, or an IPFS hash, or even another attestation.

Examples of attestations could include:

* Owner of address `0xbabe1999…` has completed a course on Solidity
* Contract at address `0x666bea5f…` is a malicious erc-20 token
* Owner of address `0xd00daa…` is a human being (i.e. not a bot)
* Owner of address `0xdeadbeef…` is a member of DimSumDAO
* Attestation `0x1435` is a (in)valid attestation
* Attestation `0x2877` is a "like" for content stored at `0xa1b2c3d4…`
* Owner of address `0x1facedf00dba11…` attended event `0xf00dba11…`

Attestations are created through things called "[portals](portals.md)" that make sure that the attestations are consistent with the logic of a specific domain.

Attestations are created in reference to "[schemas](schemas.md)", which describe the structure of the attestation data, i.e. the various fields and their respective data types.

Attestations can be [linked](linked-data.md) together to form complex graphs of attestations.  Anyone can create link between attestations, and attestations themselves can have attestations.  This allows for deriving complex [reputation scores](../discover/integrations/reputation-protocols.md) which grow more accurate the more data there is in the registry, resulting in hyperscale signal-to-noise ratio.

## Attestation Metadata

Attestations have various metadata recorded in addition to the raw attestation data itself.  A description of this metadata is listed in the table below:

<table><thead><tr><th width="169">Property</th><th width="108.33333333333331">Datatype</th><th>Description</th></tr></thead><tbody><tr><td>attestationId</td><td>bytes32</td><td>The unique identifier of the attestation</td></tr><tr><td>schemaId</td><td>bytes32</td><td>The identifier of the <a href="schemas.md">schema</a> this attestation adheres to</td></tr><tr><td>replacedBy</td><td>uint256</td><td>The attestation id that replaces this attestation</td></tr><tr><td>attester</td><td>address</td><td>The address issuing the attestation to the subject</td></tr><tr><td>portal</td><td>address</td><td>The address of the <a href="portals.md">portal</a> that created the attestation</td></tr><tr><td>attestedDate</td><td>uint64</td><td>The date the attestation is issued</td></tr><tr><td>expirationDate</td><td>uint64</td><td>The expiration date of the attestation</td></tr><tr><td>revocationDate</td><td>uint64</td><td>The date when the attestation was revoked</td></tr><tr><td>version</td><td>uint16</td><td>Version of the registry when the attestation was created</td></tr><tr><td>revoked</td><td>bool</td><td>Whether the attestation is <a href="../developer-guides/issuers/revoke-an-attestation.md">revoked</a> or not</td></tr><tr><td>revocationDate</td><td>uint64</td><td>If revoked, the date it was revoked / replaced</td></tr><tr><td>subject</td><td>bytes</td><td>The id of the attestee e.g. an EVM address, DID, URL etc.</td></tr><tr><td>attestationData</td><td>bytes</td><td>The raw attestation data</td></tr></tbody></table>

When reading attestations directly from the registry, you need the attestation id.  The attestation data that is returned from the registry in a bytes array, which can be decoded using the schema string, which can be retrieved with the schema id in the attestation metadata.

The next section describes schemas, what they are, and how they are used.


# High Level Overview

Verax is a set of smart contracts that allows dapps and protocols to register public datapoints known as attestations, that can be easily read and composed by other dapps, either directly via their own on-chain smart contracts, or via an off-chain indexer.

The real value emerges from the rich ecosystem of dapps that leverage Verax to share attestations.  This ecosystem involves several classes of actors that we can think of as being organised in a stack of layers, as visualized in the following diagram:

<figure><img src="../.gitbook/assets/Verax_Overview.png" alt=""><figcaption><p>Layered Model of Verax Ecosystem</p></figcaption></figure>

* **Infrastructure Layer:** these are the core smart contracts that allow dapps to issue and read attestations on-chain.
* **Data Layer:** these are actors that index the on-chain attestations from the registry into an off-chain database so that complex queries can be run against the data.  Eventually we hope that people can query the on-chain data using a number of different independent sources, such as Dune, or The Graph etc.  However, the community is also planning to create an open source indexer that anyone can run.
* **Compute Layer:** these are actors that run compute over the data and derive useful insights and analytics from the data.  They can surface any sort of information of value, including:
  * insights about users of specific dapps, such as demographics, interests, region etc.
  * information about the reputation of smart contracts or tokens which helps to prevent scams
  * analysis about smart contract addresses to filter out sophisticated bot activity
  * fair and transparent credit scores for under-collateralized loans
  * fair and transparent recommendation engines that deliver relevant, high quality content to users without intermediaries that may be biased or have mis-aligned incentives
* **Adoption Layer:** these are the points at which users interact with the ecosystem, and if eveything is working as it should, this is the only layer the users should be aware of.  This is where users can take advantage of the value that dapps offer them, that comes from having a shared, public datalake of attestations from which those dapps can derive valuable insights and robust permissionless reputation.  Users can discover a range of high quality dapps / services / content and be sure that is that it is all verifiable on-chain, and dapps can easily find the users that they can bring value to.

***

As Verax is composed of on-chain smart contracts that dapps issue attestations to, the first thing to learn about is how these smart contract are organized and how attestations are issued. Fortunately the core concepts are all relatively simple, so getting started is quick and easy.  The first concept to learn about is attestations themselves.


# Linked Data

One of the major benefits of using an attestation registry such as Verax for storing data, is that it consolidates public data points from various dapps into a unified on-chain datastore.  This reduces the proliferation of fragmented data-siloes of dapps using their own individual on-chain storage.

Using a consolidated data store makes it much easier to index the data and derive valuable insights.  However, there remains challenge when we start composing attestations from multiple different sources that each have their own naming conventions and semantic definitions for the attestation data.

To illustrate this with an example, consider an attestation for a person.

Attestation from Issuer A:

```
name: 沐宸
address: 0xa74b509f...
homepage: http://example.com/mypage
```

Attestation from Issuer B:

```
name: Alice
address: 0x174bb5ca2...
homepage: http://example.com/alicespage
```

We don't know if those attestation are the using the property "name" in the same way, or if they are using the property "address" in the same exact way, or "homepage" in the same way. This introduces ambiguity which creates friction for the developer that is trying to consume and compose attestations from different sources.

To makes matters worse, attestation issuers may use different naming conventions when referring to the same thing.  Consider the two following examples:

Attestation from Issuer A:

```
first_name: 沐宸
last_name: 王
home_page: http://example.com/mypage
```

Attestation from Issuer B:

```
firstName: Alice
lastName: Cooper
homePage: http://example.com/alicespage
```

Even if both attestation issuers are using fields that have the same semantic meaning, one of them is using camelCase while the other is using under\_scores.  This becomes a major headache for consumers of the attestations as they have to account for the naming conventions of different issuers.

### Contexts to the rescue

Verax borrows a concept from [JSON-LD](https://json-ld.org) called the "_context_".  Every schema that is registered has a field in it's metadata called `context` which has a string value that is either a URL or an attestation id.  The `context` field tells consumers how to interpret the fields in the schema / attestation, and they can point to well known shared vocabularies such as [schema.org](https://schema.org) so that consumers can easily understand the attestations they're consuming.

Let's look at the example above but this time both attestations are based on schemas that have the same context value:

```
context: https://schema.org/Person // ⬅︎ specified in schema's metadata
givenName: string
familyName: string
url: string
```

Attestation from Issuer A:

```
givenName: 沐宸
familyName: 王
url: http://example.com/mypage
```

Attestation from Issuer B:

```
givenName: Alice
familyName: Cooper
url: http://example.com/alicespage
```

Now both issuers are using the same naming convention, which makes it way easier to consume and compose the attestations.

## Custom Naming Conventions

Of course the example above doesn't always work in real life.  It's often the case that an attestation issuer already has an established naming convention, and it's not feasible for them change this naming convention to align with other shared vocabularies.  That's ok, because we can use custom contexts!

Custom contexts are based on a custom schema that allows an issuer to create an attestation which links their custom fields to properties in a shared vocabulary.  Lets take the example above, but this time the `context` property in the schema metadata points to an attestation that looks like this:

```json
context: "https://schema.org/Person" // ⬅︎ stored in the attestation's schema metadata
first_name: "@givenName"
last_name: "@familyName"
home_page: "@url"
address: "Ethereum mainnet address"
```

So now a consumer of any attestation that is based on a schema with the above context knows that the field `last_name` actually refers to [https://schema.org/familyName](https://schema.org/familyName).  Now developers can programmatically detect when a schema's context points to a "_context attestation_", and can automatically map the issuer's idiomatic naming convention back to that of a shared vocabulary, without needing to hardcode it (or ever even knowing anything about it).

## Shared Vocabularies

We've borrowed the context property from the [JSON-LD specification](https://json-ld.org) but we haven't taken anything else from that specification as we are trying to emphasize simplicity over complexity, and the context property is powerful enough to give rich semantic meaning to attestations.

For the same reason, we are encouraging the use of [schema.org](https://schema.org/) as a shared vocabulary, (also commonly referred to as an _ontology_). However, there are many other vocabularies / ontologies that may be better suited to other use cases, for example:

* [SIOC](http://sioc-project.org) - The _Semantically Interlinked Online Communities_ ontology is an ontology of terms that can be used to describe online communities.
* [FIBO](https://edmconnect.edmcouncil.org/fibointerestgroup/fibo-products/fibo-viewer) - The _Financial Industry Business Ontology_ defines the sets of things that are of interest in financial applications and the ways that those things can relate to one another.

There are many other ontologies available and you can discover ones that may be better suited to your specific use case using the following directories:

* [Linked Open Vocabularies](https://lov.linkeddata.es/dataset/lov/)
* [DBpedia Ontology Archive](https://archivo.dbpedia.org/list#list)

***

## Conclusion

Using shared vocabulares / ontologies is an extremely powerful way for dapps to allow easy access to their data, making it much more likely for other dapp developers to consume those attestations.  Adopting shared ontologies will allow us to develop semantically rich on-chain reputations and will allow for sophisticated permissionless discoverability of services and dapps that drive real value to users.

Schemas and Linked Data are the foundational components of the attestation registry, but actually issuing attestations based on these schemas involves two other simple concepts, [Portals](portals.md) and [Modules](modules.md).


# Modules

Modules are smart contracts that inherit the [`AbstractModule`](https://github.com/Consensys/linea-attestation-registry/blob/dev/src/interface/AbstractModule.sol) contract and are registered in the registry.  They allow for attestation creators to run custom logic in order to do things like:

* verify that attestations conform to some business logic
* verify a signature or a zk-snark
* perform other actions like transferring some tokens or minting an NFT
* recursively create another attestation

Modules are specified in a [portal](portals.md) and all attestations created by that portal are routed through the specified modules.  Modules can also be chained together into discrete pieces of specific functionality.

Each module exposes a public function called `run`:

`function run(AttestationPayload attestationPayload, bytes[] validationPayload, address txSender)`

The function executes whatever logic it needs to, and reverts if the incoming transaction doesn't conform to the required logic.  The `attestationPayload` is the raw data of the incoming attestation, and the `validationPayload` is any qualifying data that is required for verification, but that doens't make it into the on-chain attestation, e.g. a snark proof, merkle proof or signature etc.

As well as implementing the `Module` interface, a module must also implement [ERC-165](https://eips.ethereum.org/EIPS/eip-165) to ensure that it can be verified properly when being registered.

## Module Metadata

Once the module smart contract is deployed, it can be registered with the following metadata:

<table><thead><tr><th width="179">Field</th><th width="120">Type</th><th>Description</th></tr></thead><tbody><tr><td>moduleAddress</td><td>address</td><td>(required) The address of the module smart contract</td></tr><tr><td>name</td><td>string</td><td>(required) A descriptive name for the module</td></tr><tr><td>description</td><td>string (URI)</td><td>(optional) A link to documentation about the module, it’s intended use etc.</td></tr></tbody></table>

The metadata above is intended to help to discover modules that can be reused once created.  Modules are chained together and executed in [portals](portals.md).  The next section dives into portals, what they are, and how to create them.


# Portals

Portals are the entry point into the registry for attestations.  All attestations are made through portals.  A portal is normally associated with a specific issuer, who would create a portal specifically to issue their attestations with, but portals can also be open to allow anyone to use.

A portal is a smart contract that executes specific verification logic through a chain of modules  that attestations run through before being issued to the registry.  Portals also have metadata associated with them and can optionally execute lifecycle hooks.

## Portal Metadata

All portals contain certain metadata that is associated with them when they are registered:

<table><thead><tr><th width="170">Field</th><th width="120">Type</th><th>Description</th></tr></thead><tbody><tr><td>id</td><td>address</td><td>The portal id which is the address of portal contract</td></tr><tr><td>ownerAddress</td><td>address</td><td>The address of the owner of this portal</td></tr><tr><td>modules</td><td>address[]</td><td>Addresses of modules implemented by the portal</td></tr><tr><td>isRevocable</td><td>bool</td><td>Whether attestations issued can be revoked</td></tr><tr><td>name</td><td>string</td><td>(required) A descriptive name for the module</td></tr><tr><td>description</td><td>string (URI)</td><td>(optional) A link to documentation about the module, it’s intended use etc.</td></tr><tr><td>ownerName</td><td>string</td><td>The name of the owner of this portal</td></tr></tbody></table>

## Lifecycle Hooks

Each portal can specify optional lifecycle hooks that are executed at specific points in an attestations lifecycle.  Hooks are specific functions called at specific points, which include:

* **onBeforeAttest** - executed just before an attestation is first created
* **onAfterAttest** - executed just after an attestation is first created
* **onRevoke** - executed when an attestation is first revoked
* **onBulkAttest** - executed when attestations are created in bulk
* **onBulkRevoke** - executed when an attestations are revoked in bulk

## Customization

It's worth noting that the portal contract is entirely under the issuer's control and that the issuer is free to add any logic they want to portal and customize it in any way!

***

To find out how to how to create a portal, see the [Create a Portal](../developer-guides/issuers/create-a-portal.md) page for more information.


# Schemas

A schema is a blueprint for an attestation.  It describes the various fields an attestation contains and what their datatypes are.  It also describes any canonical links to other attestations that an attestation should have.  Anyone can create a schema in the registry, and once created, schemas can be re-used by anyone else.

Schemas are stored in the registry as a string value that describes the various field.  For example, to create attestations that describe a person, we can create a schema as follows:\
\
`string firstName, string lastName`

This describes a schema with two fields, both of type string.  Any attestation based on this schema can be decoded in Solidity as follows:

`(firstName, lastName) = abi.decode(attestationData, (string, string)`)

As you can see from this example, a schema is more or less a comma-separated list of tuples of property name and datatype.

## Nested Data vs. Linked Data

The convention in Verax is to use linked data rather than nested data, so for for example, to create an attestation of a "_person_" that lives at a "_place_", one would first create a **Place** schema, and then you would create a **Person** schema with a canoncial relationship field, denoted by round braces:

`string firstName, string lastName, ( isResidentAt Place 0xa1b2c3 )`&#x20;

... where `isResidentAt` is the relationship type, `Place` is the schema name, and `0xa1b2c3` is the schema id.  This indicates that any attestation based on the **Person** schema is expected to be linked to some other **Place** attestation via a relationship attestation that links them together.

This approach reduces redundant attestations, and allows for more fine-grained and reusable schemas, contributing to a growing standard library of well known and widely used schemas.

Similarly, in order to create a one-to-many canonical relationship field, you would use the syntax:

`string firstName, string lastName, [( isResidentAt Place 0xa1b2c3 )]`&#x20;

If you do decide that your schema requires nested data instead of linked data, you can use the nested data syntax, which uses curly braces instead of round braces:\
\
`string firstName, string lastName, isResidentAt {string Street, string City}`

or:

`string firstName, string lastName, isResidentAt [{string Street,string City}]`

### Relationship Attestations

The examples above use what is called a "_relationship attestation_", which is any attestation based on the special `Relationship` schema.  The relationship schema conforms to the following structure:

`bytes32 subject, string predicate, bytes32 object`

This `Relationship` schema exists as a first class citizen of the registry, and attestations that are based on this schema are used for linking other attestations together.  The `subject` field is the attestation that is being linked to another attestation, the `predicate` field is a name that describes the _type_ of relationship, and the `subject` is the attestation being linked to.

Examples of relationship attestations are:

* `0x46582...` "isFollowerOf" `0x10345...`
* `0x31235...` "hasVotedFor" `0x52991...`
* `0x74851...` "isAlumniOf" `0x31122...`

Anyone can create any type of relationship between any attestation and any number of other attestations, allowing for the emergence of an organic [folksonomy](https://en.wikipedia.org/wiki/Folksonomy).  However, it also makes canonical relationships important to define in the schema, as otherwise there will be ambiguity between which relationship attestations were intended by the attestation issuer, and which were relationship attestations that were arbitrarily added later by third parties.

## Triples, Quads and Named Graphs

Many readers will have recognised that the Relationship schema is actually just an [RDF triple](https://en.wikipedia.org/wiki/Semantic\_triple).  The fact that RDF triples are used to link attestations to each other means that the on-chain attestation data can easily be indexed into a graph DB and can be serialized using RDFS, OWL, Turtle etc.

Certain use cases may require that relationships be grouped together into a named graph.  In this case there is a special `namedGraphRelationship` schema that can be utilized, which looks like:

`string namedGraph, bytes32 subject, string predicate, bytes32 object`

## Counterfactual Schemas

Schema ids are unique to the schema content, and are created from the keccak hash of the schema string.  This means that schemas can be created counterfactually, allowing for things like circular relationships between schemas.  It also means that two people can't create the exact same schema, which in turn, promotes re-usability within the registry.

## Inheritance

Schemas can also inherit fron other schema, which is another way that Verax reduces redundant schema data and promotes reusability.  To inherit from another schema, simply add the parent schema id at the very start of the schema string preceded by the `@extends` keyword, e.g.:

`@extends 0xa1b2c3... string firstName, string lastName`

This will tell indexers to look up the schema referenced by the `extends` keyword, and concatentate it's schema string with the schema string in this schema.  Note that any conflicting field names will be overridden by the last previous definition, so for example, if a field name exist in a parent schema and a child schema, the field definition from the child schema will be used.  Also, schemas can only inherit from one parent at a time.

**NOTE:** caution should be taken with this feature as it it somewhat experimental and may not be supported by all indexers!

## Schema MetaData

As well as the schema string, schemas have some metadata that is stored with them:

<table><thead><tr><th width="162.33333333333331">Property</th><th width="108">Datatype</th><th>Description</th></tr></thead><tbody><tr><td>name</td><td>string</td><td>(r<em>equired)</em> The name of schema, stored on-chain</td></tr><tr><td>description</td><td>string</td><td>A link to off-chain description / documentation</td></tr><tr><td>context</td><td>string</td><td>(r<em>equired)</em> A link to some shared vocabulary / ontology</td></tr><tr><td>schema</td><td>string</td><td><em>(required)</em> The raw schema string as described above</td></tr></tbody></table>

## Schema Contexts / Shared Vocabularies

Schemas have a field called "_context_" which is usually a link to some shared vocabulary.  This is an important field that gives semantic meaning to the schema, allowing consumers of the attestation to understand exactly what the fields in the schema represent.  This removes ambiguity and also allows reputation protocols to build powerful semantic graphs when indexing attestations.

For more information on this property and how important it is, see the [Linked Data](linked-data.md) page.

