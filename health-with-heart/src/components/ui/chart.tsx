"use client"

import * as React from "react"
import { ResponsiveContainer } from "recharts"

export interface ChartConfig {
  [key: string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={className}
        {...props}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: Object.entries(config)
              .filter(([, config]) => config.color)
              .map(([key, itemConfig]) => {
                const color = itemConfig.color || "hsl(var(--chart-1))"
                return `[data-chart=${chartId}] { --color-${key}: ${color}; }`
              })
              .join("\n"),
          }}
        />
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={className}
      {...props}
    />
  )
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: unknown[]
    label?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }
>(
  (
    {
      active,
      payload,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelKey,
      nameKey,
      color,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    if (!active || !payload?.length) {
      return null
    }

    const tooltipLabel = hideLabel
      ? ""
      : (labelKey && (payload?.[0] as any)?.[labelKey]) || label

    return (
      <div
        ref={ref}
        className="rounded-lg border bg-background p-2 shadow-sm"
        {...props}
      >
        <div className="grid gap-2">
          {!hideLabel && tooltipLabel && (
            <div className="font-medium text-foreground">{tooltipLabel}</div>
          )}
          <div className="grid gap-1.5">
            {payload.map((item, index) => {
              const key = `${nameKey || (item as any)?.dataKey || "value"}`
              const itemConfig = getPayloadConfigFromPayload(config, item as any, key)
              const indicatorColor = color || (item as any)?.payload?.fill || (item as any)?.color

              return (
                <div
                  key={`chart-item-${index}-${(item as any)?.dataKey}`}
                  className="flex w-full items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground"
                >
                  {!hideIndicator && (
                    <div
                      className="shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]"
                      style={
                        {
                          "--color-bg": indicatorColor,
                          "--color-border": indicatorColor,
                        } as React.CSSProperties
                      }
                    />
                  )}
                  <div className="flex flex-1 justify-between leading-none">
                    <div className="grid gap-1.5">
                      <span className="text-muted-foreground">
                        {itemConfig?.label || (item as any)?.dataKey}
                      </span>
                    </div>
                    {(item as any)?.value && (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {(item as any)?.value?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: Record<string, unknown>,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    typeof payload.payload === "object" && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key] === "string"
  ) {
    configLabelKey = payload[key] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof (payloadPayload as any)[key] === "string"
  ) {
    configLabelKey = (payloadPayload as any)[key] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
}