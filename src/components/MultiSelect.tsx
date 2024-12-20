import React, { useEffect, useRef, useState } from "react";
import styles from "./MultiSelect.module.scss";

interface Option {
    label: string;
    value: string;
}

interface MultiSelectProps {
    options: Option[];
    onChange?: (selectedOptions: Option[]) => void;
    id?: string;
}

const MultiSelect = ({ options, ...props }: MultiSelectProps) => {
    const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(
        null,
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        setIsOpen(true);
        setHighlightedIndex(null);
    };

    const handleOptionClick = (option: Option) => {
        if (
            !selectedOptions.find((selected) => selected.value === option.value)
        ) {
            setSelectedOptions([...selectedOptions, option]);
            props.onChange?.([...selectedOptions, option]);
        } else {
            const newOptions = selectedOptions.filter((value) => value !== option);
            setSelectedOptions(newOptions);
            props.onChange?.([...newOptions]);
        }
        setInputValue("");
        if (inputRef.current) {
            inputRef.current.focus();
        }
        setHighlightedIndex(null);
    };

    const handleRemoveOption = (option: Option) => {
        setSelectedOptions(
            selectedOptions.filter((selected) =>
                selected.value !== option.value
            ),
        );
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlightedIndex((prevIndex) => {
                if (prevIndex === null) return 0;
                return Math.min(prevIndex + 1, filteredOptions.length - 1);
            });
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlightedIndex((prevIndex) => {
                if (prevIndex === null) return filteredOptions.length - 1;
                return Math.max(prevIndex - 1, 0);
            });
        } else if (event.key === "Enter" && highlightedIndex !== null) {
            event.preventDefault();
            handleOptionClick(filteredOptions[highlightedIndex]);
        } else if (event.key === "Escape") {
            setIsOpen(false);
            setHighlightedIndex(null);
        } else if (event.key === "Backspace" && inputValue === "") {
            setSelectedOptions(selectedOptions.slice(0, -1));
        }
    };

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    useEffect(() => {
        if (highlightedIndex !== null && listRef.current) {
            const listItem = listRef.current
                .children[highlightedIndex] as HTMLElement;
            listItem.scrollIntoView({ block: "nearest" });
        }
    }, [highlightedIndex]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setHighlightedIndex(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.view} ref={containerRef}>
            <div className={styles.inputContainer} onClick={() => inputRef.current?.focus()}>
                {selectedOptions.map((option) => (
                    <span key={option.value} className={styles.selectedOption}>                        
                        <button
                            type="button"
                            onClick={() =>
                                handleRemoveOption(option)}
                            aria-label={`Remove ${option.label}`}
                        >
                            &times;
                        </button>
                        {option.label}
                    </span>
                ))}
                <input
                    id={props.id}
                    type="text"
                    role="combobox"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setIsOpen(false)}
                    onKeyDown={handleKeyDown}
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                    aria-autocomplete="list"
                    aria-activedescendant={highlightedIndex
                        ? `option-${highlightedIndex}`
                        : undefined}
                    ref={inputRef}
                />
            </div>
            
                <ul
                    className={styles.optionsList}
                    style={{ display: isOpen ? "block" : "none" }}
                    id="options-list"
                    role="listbox"
                    ref={listRef}
                >
                    {filteredOptions.map((option, index) => (
                        <li
                            key={option.value}
                            id={`option-${index}`}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleOptionClick(option);
                            }}
                            role="option"
                            aria-selected={selectedOptions.includes(option)}
                            className={highlightedIndex === index
                                ? styles.highlightedOption
                                : ""}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
        </div>
    );
};

export default MultiSelect;
