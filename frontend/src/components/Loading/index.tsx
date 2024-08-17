export default function Loading({ sidebar = false }: { sidebar?: boolean }) {
  return (
    <div>
      {sidebar ? (
        <div className="w-64 min-h-[calc(100vh-144px)] bg-gray-50 p-4 text-gray-600 flex justify-center items-center">
          <div className="flex justify-center items-center">
            <h2 className="text-center text-3xl font-semibold mt-2">
              <img className="w-36" src="/images/loading.svg" alt="loading" />
            </h2>
          </div>
        </div>
      ) : (
        <div className="bg-stone-50 flex flex-col items-center justify-center w-full h-full min-h-[calc(100vh-144px)] text-gray-600">
          <img className="w-36" src="/images/loading.svg" alt="loading" />
        </div>
      )}
    </div>
  );
}
