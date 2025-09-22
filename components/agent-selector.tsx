"use client"

import * as React from "react"
import { ChevronDown, Check, Bot } from "lucide-react"
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
          <Card className="w-full cursor-pointer border-2 border-gray-600 hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-bold text-sm text-white break-words">
                    {currentAgent?.name || "Select an AI Agent"}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2 mt-1 break-words">
                    {currentAgent?.description || "Choose your AI assistant to start creating amazing ad copy"}
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center h-10">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-gray-800 border-gray-600" side="bottom" align="start">
        <Command className="bg-gray-800 text-white [&_[cmdk-input]]:bg-gray-800 [&_[cmdk-input]]:text-white [&_[cmdk-input]]:border-gray-600 [&_[cmdk-input]]:placeholder-gray-400">
          <CommandInput 
            placeholder="Search agents..." 
            className="h-9 bg-gray-800 text-white border-gray-600 placeholder:text-gray-400 focus:border-gray-500" 
          />
          <CommandEmpty className="text-gray-400">No agents found.</CommandEmpty>
          <CommandGroup>
            <CommandList className="max-h-[300px] bg-gray-800">
              {agents.map((agent: any) => (
                <CommandItem
                  key={agent.id}
                  value={agent.name}
                  onSelect={() => handleAgentSelect(agent.name)}
                  className={`flex items-center space-x-3 p-3 cursor-pointer text-white ${
                    selectedAgent === agent.name 
                      ? 'bg-gray-700 !text-white' 
                      : 'hover:bg-gray-700 !text-white'
                  } [&[data-selected=true]]:bg-gray-700 [&[data-selected=true]]:!text-white`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="font-bold text-sm truncate text-white">{agent.name}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 mt-0.5 break-words">
                      {agent.description}
                    </div>
                  </div>
                  {selectedAgent === agent.name && (
                    <Check className="h-4 w-4 text-white" />
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
