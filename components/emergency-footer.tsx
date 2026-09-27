import { Navigation, Phone } from 'lucide-react'

const HELPLINES = [
  {
    label: 'Police',
    number: '112',
    dial: '112',
    note: 'Single number for all emergencies',
  },
  {
    label: 'Fire Brigade ',
    number: '101',
    dial: '101',
    note: 'Fire brigade control room',
  },
  {
    label: 'Ambulance',
    number: '108 / 102',
    dial: '108',
    note: 'Medical emergency & ambulance',
  },
  {
    label: 'National Highway Helpline (NHAI)',
    number: '1033',
    dial: '1033',
    note: 'Accidents & road hazards',
  },
]

export function EmergencyFooter() {
  return (
    <footer
      className="
        border-t
        border-slate-200
        bg-slate-50
        text-slate-900
        transition-colors
        duration-300

       dark:border-[#16345f]
       dark:bg-[#07152f]
        dark:text-slate-100
      "
    >
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <span
            className="
              font-display
              text-sm
              font-bold
              uppercase
              tracking-widest
              text-blue-600
              dark:text-blue-400
            "
          >
            Emergency Road Helplines
          </span>

          <h2
            className="
              font-display
              text-2xl
              font-extrabold
              text-balance
              text-slate-900
              dark:text-white
            "
          >
            Save these numbers before you hit the road
          </h2>
        </div>

        {/* HELPLINE CARDS */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HELPLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.dial}`}
              className="
                group
                flex
                flex-col
                gap-1
                rounded-xl
                border
                border-slate-200
                bg-white
                p-4

                transition-all
                duration-200

                hover:-translate-y-1
                hover:border-blue-300
                hover:bg-blue-50
                hover:shadow-lg
                hover:shadow-blue-500/10

                dark:border-[#1d3b68]
dark:bg-[#0c2144]
dark:hover:border-blue-500/60
dark:hover:bg-[#102b55]
                dark:hover:shadow-blue-500/10
              "
            >
              {/* LABEL */}
              <span
                className="
                  text-xs
                  font-medium
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {h.label}
              </span>

              {/* NUMBER */}
              <span
                className="
                  flex
                  items-center
                  gap-2
                  font-display
                  text-xl
                  font-bold
                  text-slate-900
                  transition-colors
                  duration-200

                  group-hover:text-blue-600

                  dark:text-white
                  dark:group-hover:text-blue-400
                "
              >
                <Phone
                  className="
                    size-4
                    text-blue-600
                    transition-transform
                    duration-200
                    group-hover:scale-110
                    dark:text-blue-400
                  "
                  aria-hidden
                />

                {h.number}
              </span>

              {/* NOTE */}
              <span
                className="
                  text-xs
                  text-slate-500
                  dark:text-slate-500
                "
              >
                {h.note}
              </span>
            </a>
          ))}
        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-10
            flex
            flex-col
            items-start
            justify-between
            gap-4
            border-t
            border-slate-200
            pt-6

            dark:border-[#16345f]

            sm:flex-row
            sm:items-center
          "
        >
          {/* BRAND */}
          <div className="flex items-center gap-2">
            <span
              className="
                flex
                size-8
                items-center
                justify-center
                rounded-lg
                bg-blue-600
                text-white
                shadow-sm
                shadow-blue-600/20
              "
            >
              <Navigation
                className="size-4"
                aria-hidden
              />
            </span>

            <span
              className="
                font-display
                text-lg
                font-extrabold
                text-slate-900
                dark:text-white
              "
            >
              ResQ
              <span className="text-blue-600 dark:text-blue-400">
                Route
              </span>
            </span>
          </div>

          {/* DESCRIPTION */}
          <p
            className="
              max-w-xl
              text-xs
              text-pretty
              text-slate-500
              dark:text-slate-500
            "
          >
            ResQRoute helps you find help fast. In any life-threatening
            emergency, always call your local emergency number first.
          </p>
        </div>
      </div>
    </footer>
  )
}