import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export interface KudFlowProps {
  names: ReadonlyArray<string>;
}

/** Rantai pasok empat simpul; nama KUD ditampilkan bila sudah ada mitra aktif. */
export function KudFlow({ names }: KudFlowProps): ReactNode {
  const stages = [
    "Limbah bonggol jagung",
    "Fermentasi terkendali",
    "Pelet konsentrat",
    "Kandang anggota KUD",
  ];

  return (
    <div>
      <ol className="flex flex-wrap items-center gap-xs">
        {stages.map((stage, index) => (
          <li className="flex items-center gap-xs" key={stage}>
            <span className="rounded-md bg-surface px-md py-xs type-body-sm text-text">{stage}</span>
            {index < stages.length - 1 ? (
              <ArrowRight
                aria-hidden="true"
                className="text-text-secondary"
                size={18}
                strokeWidth={1.75}
              />
            ) : null}
          </li>
        ))}
      </ol>
      {names.length > 0 ? (
        <ul className="mt-md flex flex-wrap gap-xs">
          {names.map((name) => (
            <li
              className="rounded-pill bg-primary-soft px-sm py-2xs type-caption text-primary"
              key={name}
            >
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
