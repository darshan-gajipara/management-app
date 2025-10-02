import { format } from "date-fns";

export default function dateFormat(dateString: string) {
    const date = new Date(dateString);
    const formateDate  = format(date, 'dd/MM/yyyy');
    return formateDate;
}