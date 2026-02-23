"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

export interface SearchableOption {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: SearchableOption[]
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    className?: string
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Select an option...",
    disabled = false,
    className
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between font-normal bg-background hover:bg-muted/50", className)}
                    disabled={disabled}
                >
                    <span className="truncate">
                        {value
                            ? options.find((option) => option.value === value)?.label || placeholder
                            : placeholder}
                    </span>
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
                                    onSelect={() => {
                                        onValueChange(option.value)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer"
                                >
                                    {option.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4 text-primary",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
