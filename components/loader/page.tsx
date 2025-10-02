import { Loader } from "lucide-react";

export default function LoaderComponent() {
    return (<div className="flex items-center justify-center h-full w-full">
        <Loader size={32} className="animate-spin" />
    </div>)
}