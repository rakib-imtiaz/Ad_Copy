"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface AgentSelectorProps {
  agents: any[]
  selectedAgent: string
  onSelectAgent: (agent: string) => void
  onOpenChange?: (open: boolean) => void
  isLoading?: boolean
  onRefresh?: () => void
}

export function AgentSelector({ 
  agents, 
  selectedAgent, 
  onSelectAgent, 
  onOpenChange, 
  isLoading, 
  onRefresh 
}: AgentSelectorProps) {
  const [open, setOpen] = React.useState(false)
  
  // Memoize currentAgent to prevent unnecessary recalculations
  const currentAgent = React.useMemo(() => 
    agents.find((agent: any) => agent.name === selectedAgent), 
    [agents, selectedAgent]
  )

  // Memoize the click handler to prevent unnecessary re-renders
  const handleAgentSelect = React.useCallback((agentName: string) => {
    onSelectAgent(agentName)
    setOpen(false)
    onOpenChange?.(false)
  }, [onSelectAgent, onOpenChange])

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="text-center">
          <Skeleton className="h-4 w-32 mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto p-0 border-0 bg-transparent"
        >
          <Card className="w-full cursor-pointer border-2 border-muted hover:border-primary/50 transition-all duration-200 shadow-sm hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-lg">
                    {currentAgent?.icon || "🤖"}
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-semibold text-sm text-foreground break-words">
                    {currentAgent?.name || "Select an AI Agent"}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1 break-words">
                    {currentAgent?.description || "Choose your AI assistant to start creating amazing ad copy"}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center h-10">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" side="bottom" align="start">
        <Command>
          <CommandInput placeholder="Search agents..." className="h-9" />
          <CommandEmpty>No agents found.</CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[300px]">
              {agents.map((agent: any) => (
                <CommandItem
                  key={agent.id}
                  value={agent.name}
                  onSelect={() => handleAgentSelect(agent.name)}
                  className="flex items-center space-x-3 p-3 cursor-pointer"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-sm">
                      {agent.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="font-medium text-sm truncate">{agent.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5 break-words">
                      {agent.description}
                    </div>
                  </div>
                  {selectedAgent === agent.name && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
