import Button, { ButtonVariant } from "@/components/Button";
import FormElement from "@/components/FormElement";
import FormLabel from "@/components/FormLabel";
import InputText from "@/components/InputText";
import MultiSelect, { Option } from "@/components/MultiSelect";

import CityIcon from "@/img/icon-city.svg";
import CalendarIcon from "@/img/icon-calendar.svg";

import styles from "./FilterForm.module.scss";
import { FormEventHandler } from "react";

const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${
        date.getDate() < 10 ? "0" : ""
    }${date.getDate()}`;
};

export default function FilterForm() {
    const cityOptions = [
        {
            "label": "Burlington",
            "value": "burlington",
        },
        {
            "label": "Halton Hills",
            "value": "halton hills",
        },
        {
            "label": "Milton",
            "value": "milton",
        },
        {
            "label": "Oakville",
            "value": "oakville",
        },
        {
            "label": "Georgetown",
            "value": "georgetown",
        },
        {
            "label": "Acton",
            "value": "acton",
        },
    ] satisfies Option[];

    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    
    const onSubmit : FormEventHandler<HTMLFormElement> = (evt) => {
        evt.preventDefault();

        const evalDate = (dateStr: string, boundary: 'start' | 'end') => {
            let newDate = Date.parse(dateStr);
            if (boundary == 'end') {
                let baseDate = new Date(newDate);
                newDate = new Date(newDate).setDate(baseDate.getDate() + 1);
                newDate = new Date(newDate).setMilliseconds(baseDate.getMilliseconds() - 1);
            }
            return newDate
        }

        const formData = new FormData(evt.target as HTMLFormElement);
        formData.set('startDate', `${evalDate(formData.get('startDate') as string, 'start')}`);
        formData.set('endDate', `${evalDate(formData.get('endDate') as string, 'end')}`);
        const urlParams = new URLSearchParams(formData.entries().map(([key, val]) => {
            return [key, val as string];
        }).toArray());
        fetch('/api/data?' + urlParams);
    }

    return (
        <form className={styles.filterForm} onSubmit={onSubmit}>
            <FormElement>
                <FormLabel
                    icon={{ src: CalendarIcon, alt: "" }}
                    htmlFor="startDate"
                >
                    Start Date
                </FormLabel>
                <InputText
                    style={{ width: "100%" }}
                    id="startDate"
                    name="startDate"
                    type="date"
                    defaultValue={formatDate(defaultStartDate)}
                />
            </FormElement>
            <FormElement>
                <FormLabel
                    icon={{ src: CalendarIcon, alt: "" }}
                    htmlFor="endDate"
                >
                    End Date
                </FormLabel>
                <InputText
                    style={{ width: "100%" }}
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={formatDate(defaultEndDate)}
                />
            </FormElement>
            <FormElement>
                <FormLabel icon={{ src: CityIcon, alt: "" }} htmlFor="city">
                    Municipality
                </FormLabel>
                <MultiSelect
                    options={cityOptions}
                    defaultValues={[
                        "burlington",
                        "milton",
                        "oakville",
                        "halton hills",
                    ]}
                    id="city"
                    name="city"
                />
            </FormElement>
            <div className={styles.buttonRow}>
                <Button variant={ButtonVariant.Primary} type="submit">
                    Search
                </Button>
            </div>
        </form>
    );
}
