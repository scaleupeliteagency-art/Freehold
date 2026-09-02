export default function StepIdentity({ data, updateData }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-gray-900">System Identity</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Establish the identity and fundamental purpose of your system.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 border-t border-gray-900/10 pt-8">
        <div className="sm:col-span-4">
          <label htmlFor="systemName" className="block text-sm font-medium leading-6 text-gray-900">
            System Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="systemName"
              id="systemName"
              placeholder="e.g. Ascend Growth System"
              value={data.name || ""}
              onChange={(e) => updateData({ name: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B8862E] sm:text-sm sm:leading-6 px-3"
            />
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="why" className="block text-sm font-medium leading-6 text-gray-900">
            Why does this system exist?
          </label>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            A meaningful explanation of why you are building this system.
          </p>
          <div className="mt-2">
            <textarea
              id="why"
              name="why"
              rows={4}
              placeholder="e.g. Build Ascend into a profitable international acquisition agency..."
              value={data.why || ""}
              onChange={(e) => updateData({ why: e.target.value })}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#B8862E] sm:text-sm sm:leading-6 px-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
