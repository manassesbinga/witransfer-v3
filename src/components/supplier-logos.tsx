import db from "@/data/db.json";

export function SupplierLogos() {
  // Extrair fornecedores únicos do JSON
  const suppliersMap = new Map();
  (db.cars || []).forEach((car: any) => {
    if (!suppliersMap.has(car.supplier)) {
      suppliersMap.set(car.supplier, car.supplierLogo);
    }
  });

  const suppliers = Array.from(suppliersMap.entries())
    .filter(([name, logo]) => name && logo) // Garante que temos nome e logo
    .map(([name, logo]) => ({
      name,
      logo,
    }));

  return (
    <section className="py-8 md:py-10 bg-white border-y border-gray-100">
      <div className="container mx-auto px-4">
        <p className="text-center text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 md:mb-8">
          Trabalhamos com os maiores fornecedores mundiais
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12 lg:gap-14">
          {suppliers.map((supplier) => (
            <div
              key={supplier.name}
              className="grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
            >
              <img
                src={supplier.logo}
                alt={supplier.name}
                className="h-5 sm:h-6 md:h-8 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
