import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-600 flex items-center justify-between">
      <Link href="/" passHref>
        <h1 className="text-4xl font-bold text-gray-600">
          <img className="w-28" src="/images/logo.png"></img>
        </h1>
      </Link>
      <nav className="flex items-center space-x-10 text-3xl font-extrabold text-zinc-200 pr-10">
        <Link href="/" passHref>
          Home
        </Link>
        <Link href="/catalog" className="hover:text-red-500" passHref>
          Catalog
        </Link>
        <Link href="/signin" passHref>
          <button className="p-5 rounded-xl text-xl bg-red-500 hover:bg-white hover:text-black">
            Sign in
          </button>
        </Link>
        <Link href="/cart" passHref>
          <div className="py-2">
            <img src="/images/bag.svg" alt="cart" className="w-10" />
          </div>
        </Link>
      </nav>
    </header>
  );
}
