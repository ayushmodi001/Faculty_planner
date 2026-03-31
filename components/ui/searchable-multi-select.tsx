"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface SearchableOption {
    value: string
    label: string
}

interface SearchableMultiSelectProps {
    options: SearchableOption[]
    value: string[]
    onValueChange: (value: string[]) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function SearchableMultiSelect({
    options,
    value = [],
    onValueChange,
    placeholder = "Select options...",
    disabled = false,
    className
}: SearchableMultiSelectProps) {
    const [open, setOpen] = React.useState(false)

    const handleSelect = (optionValue: string) => {
        const newValue = value.includes(optionValue)
            ? value.filter((v) => v !== optionValue)
            : [...value, optionValue]
        onValueChange(newValue)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full h-auto min-h-11 justify-between font-normal bg-background hover:bg-muted/50 p-2", className)}
                    disabled={disabled}
                >
                    <div className="flex flex-wrap gap-1">
                        {value.length > 0 ? (
                            value.map((v) => (
                                <Badge 
                                    key={v} 
                                    variant="secondary" 
                                    className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-[#0A1128] hover:bg-slate-200 border-none px-2 py-0.5"
                                >
                                    {options.find((opt) => opt.value === v)?.label || v}
                                    <X className="ml-1 h-2 w-2 cursor-pointer" onClick={(e) => {
                                        e.stopPropagation()
                                        handleSelect(v)
                                    }} />
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground ml-2">{placeholder}</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" style={{ width: "var(--radix-popover-trigger-width)" }} align="start">
                <Command>
                    <CommandInput placeholder="Search..." className="h-9" />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                    className="cursor-pointer"
                                >
                                    <div className={cn(
                                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                        value.includes(option.value)
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible"
                                    )}>
                                        <Check className="h-4 w-4" />
                                    </div>
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
