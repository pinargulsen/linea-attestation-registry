import { Attestation } from "@verax-attestation-registry/verax-sdk";
import { t } from "i18next";
import { Hex, hexToNumber } from "viem";

import { Link } from "@/components/Link";
import { links } from "@/constants";
import { toPortalById } from "@/routes/constants";
import { displayAmountWithComma } from "@/utils/amountUtils";
import { cropString } from "@/utils/stringUtils";

import { createDateListItem } from "./utils";

export const AttestationInfo: React.FC<Attestation> = ({ ...attestation }) => {
  const { attestedDate, expirationDate, revocationDate, id, revoked, attester, portal, subject } = attestation;
  const list: Array<{ title: string; value: string; to?: string; link?: string }> = [
    createDateListItem(t("attestation.info.attested"), attestedDate.toString()),
    createDateListItem(t("attestation.info.expirationDate"), expirationDate.toString()),
    {
      title: t("attestation.info.revoked.title"),
      value: revoked ? t("attestation.info.revoked.yes") : t("attestation.info.revoked.no"),
    },
    createDateListItem(t("attestation.info.revocationDate"), revocationDate?.toString()),
    {
      title: t("attestation.info.issuedBy"),
      value: cropString(attester),
      link: `${links.lineascan.address}/${attester}`,
    },
    {
      title: t("attestation.info.portal"),
      value: cropString(portal),
      to: toPortalById(portal),
    },
    {
      title: t("attestation.info.subject"),
      value: cropString(subject),
      link: `${links.lineascan.address}/${subject}`,
    },
  ];

  return (
    <div className="flex flex-col w-full items-start gap-6">
      <div className="font-semibold text-page-attestation text-2xl whitespace-nowrap md:text-3xl">
        #{displayAmountWithComma(hexToNumber(id as Hex))}
      </div>
      <div className="gap-6 flex flex-col items-start w-full md:flex-wrap md:h-[170px] md:content-between xl:flex-nowrap xl:h-auto">
        {list.map((item) => (
          <div key={item.title} className="inline-flex gap-2 w-full justify-between text-xs items-center md:w-auto">
            <div className="min-w-[120px] font-normal text-text-quaternary">{item.title.toUpperCase()}</div>
            {item.to && (
              <Link
                to={item.to}
                className="text-text-secondary whitespace-nowrap self-stretch overflow-hidden text-ellipsis md:text-base hover:underline"
              >
                {item.value}
              </Link>
            )}

            {item.link && (
              <a
                href={item.link}
                target="_blank"
                className="text-text-secondary whitespace-nowrap self-stretch overflow-hidden text-ellipsis md:text-base hover:underline"
              >
                {item.value}
              </a>
            )}

            {!item.to && !item.link && (
              <div className="text-text-secondary whitespace-nowrap self-stretch overflow-hidden text-ellipsis md:text-base">
                {item.value}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
