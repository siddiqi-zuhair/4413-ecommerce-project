import { Item } from "../../../interfaces/item";

export default function Product({ item }: { item: Item }) { 
 

    return (
        <div className="bg-stone-50 flex flex-col items-center justify-start w-full h-full text-gray-600 ">
            <p className="text-8xl font-black tracking-wider">Mario</p>
        </div>
    )

}