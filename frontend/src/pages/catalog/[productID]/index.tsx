
export default function Product(){ 
 
      const mario: Item = {
        name: "Mario",
        price: 60,
        quantity: 10,
        description: "Mario is a platform game",
        platform: "Nintendo",
        image: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1mxf.webp",
        video: "https://www.youtube.com/embed/5kcdRBHM7kM",
      };

    return (
        <div className="bg-stone-50 flex flex-col items-center justify-start w-full h-full text-gray-600 ">
            <p className="text-8xl font-black tracking-wider">Mario</p>
        </div>
    )

}