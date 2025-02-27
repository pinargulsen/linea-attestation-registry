import { OrderDirection } from "@verax-attestation-registry/verax-sdk/lib/types/.graphclient";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useSWR from "swr";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { ITEMS_PER_PAGE_DEFAULT, ZERO } from "@/constants";
import { attestationColumnsOption, columns, skeletonAttestations } from "@/constants/columns/attestation";
import { columnsSkeleton } from "@/constants/columns/skeleton";
import { EQueryParams } from "@/enums/queryParams";
import { ETableSorting } from "@/enums/tableSorting";
import { SWRKeys } from "@/interfaces/swr/enum";
import { useNetworkContext } from "@/providers/network-provider/context";
import { getItemsByPage, pageBySearchParams } from "@/utils/paginationUtils";

import { TitleAndSwitcher } from "./components/TitleAndSwitcher";

export const Attestations: React.FC = () => {
  const {
    sdk,
    network: { chain },
  } = useNetworkContext();

  const { data: attestationsCount } = useSWR(
    `${SWRKeys.GET_ATTESTATION_COUNT}/${chain.id}`,
    () => sdk.attestation.getAttestationIdCounter() as Promise<number>,
  );

  const [searchParams] = useSearchParams();

  const totalItems = attestationsCount ?? ZERO;
  const page = pageBySearchParams(searchParams, totalItems);
  const sortByDateDirection = searchParams.get(EQueryParams.SORT_BY_DATE);

  const [skip, setSkip] = useState<number>(getItemsByPage(page));

  const { data: attestationsList, isLoading } = useSWR(
    `${SWRKeys.GET_ATTESTATION_LIST}/${skip}/${sortByDateDirection}/${chain.id}`,
    () =>
      sdk.attestation.findBy(
        ITEMS_PER_PAGE_DEFAULT,
        skip,
        undefined,
        "attestedDate",
        (sortByDateDirection as OrderDirection) || ETableSorting.DESC,
      ),
  );

  const handlePage = (retrievedPage: number) => {
    setSkip(getItemsByPage(retrievedPage));
  };

  const columnsSkeletonRef = useRef(columnsSkeleton(columns(), attestationColumnsOption));

  const data = isLoading
    ? { columns: columnsSkeletonRef.current, list: skeletonAttestations() }
    : { columns: columns({ sdk }), list: attestationsList || [] };

  return (
    <TitleAndSwitcher>
      <DataTable columns={data.columns} data={data.list} />
      {attestationsCount && <Pagination itemsCount={attestationsCount} handlePage={handlePage} />}
    </TitleAndSwitcher>
  );
};
