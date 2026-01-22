
import { getCategoriesAction, getExtrasAction, getServiceCategoriesAction } from "@/actions/private/catalog/actions"
import { getPartnersAction } from "@/actions/private/partners/actions"
import { getAdminSessionInternal } from "@/actions/private/session"
import CreateVehicleWrapper from "@/components/form/create-vehicle-wrapper"

export default async function NewVehiclePage() {
    const session = await getAdminSessionInternal()

    const [
        categoriesRes,
        featuresRes,
        servicesRes,
        partnersRes
    ] = await Promise.all([
        getCategoriesAction(),
        getExtrasAction(),
        getServiceCategoriesAction(),
        getPartnersAction()
    ])

    // Helper to extract data whether it's direct array or enveloped in .data
    const extractData = (res: any) => Array.isArray(res) ? res : (res?.data || [])

    const categories = extractData(categoriesRes)
    const rawFeatures = extractData(featuresRes)
    const features = rawFeatures.filter((e: any) =>
        e.type === 'vehicle_feature' || e.type === 'service_extra' || !e.type
    )
    const services = extractData(servicesRes)
    const partners = extractData(partnersRes)

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <CreateVehicleWrapper
                partners={partners}
                categories={categories}
                features={features}
                services={services}
                currentUser={session}
            />
        </div>
    )
}
