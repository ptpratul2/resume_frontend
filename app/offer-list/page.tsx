"use client"
import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from '@/lib/api-config'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Mail, Calendar, Building2, User, FileText, Briefcase, FileCheck, Search, Filter } from "lucide-react"

export default function OfferListPage() {
    const [offers, setOffers] = useState<any[]>([])
    const [selectedOffer, setSelectedOffer] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")


    const fetchOffers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/method/resume.api.get_job_offer_list`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const jsonData = await res.json()
            const data = jsonData?.message?.data || []
            setOffers(data)
        } catch (err) {
            console.error("Error fetching offers:", err)
            setOffers([])
        } finally {
            setLoading(false)
        }
    }

    const fetchOfferDetails = async (name: string) => {
        setLoading(true)
        try {
            const res = await fetch(`${API_BASE_URL}/api/method/resume.api.get_job_offer_details?job_offer_name=${encodeURIComponent(name)}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const jsonData = await res.json()
            const data = jsonData?.message?.data
            setSelectedOffer(data)
        } catch (err) {
            console.error("Error fetching offer details:", err)
            setSelectedOffer(null)
        } finally {
            setLoading(false)
        }
    }
    const filteredOffers = offers.filter((offer) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            searchQuery === "" ||
            (offer.applicant_name || "").toLowerCase().includes(searchLower) ||
            (offer.applicant_email || "").toLowerCase().includes(searchLower) ||
            (offer.designation || "").toLowerCase().includes(searchLower) ||
            (offer.company || "").toLowerCase().includes(searchLower) ||
            (offer.name || "").toLowerCase().includes(searchLower)
        )
    })

    const getStatusColor = (status: string) => {
        const normalizedStatus = status?.toLowerCase() || ""
        if (normalizedStatus.includes("accept")) return "bg-green-100 text-green-800 border-green-200"
        if (normalizedStatus.includes("reject")) return "bg-red-100 text-red-800 border-red-200"
        if (normalizedStatus.includes("pending") || normalizedStatus.includes("awaiting")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-blue-100 text-blue-800 border-blue-200"
    }

    useEffect(() => {
        fetchOffers()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-slate-600">Loading offers...</p>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto p-8 space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Button>
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Job Offer Letters
                        </h1>
                        <p className="text-slate-600">View and manage all job offers</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
                        <div className="text-center">
                            <p className="text-sm text-slate-600 mb-1">Total Offers</p>
                            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {offers.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by candidate name, email, position, company, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 h-12 border-0 bg-slate-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Card */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    {!selectedOffer ? (
                        <>
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-xl">All Candidates</span>
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {filteredOffers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredOffers.map((offer) => (
                                            <Card
                                                key={offer.name}
                                                className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 cursor-pointer"
                                                onClick={() => fetchOfferDetails(offer.name)}
                                            >
                                                {/* Decorative Element */}
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                                                <CardContent className="p-6 relative z-10">
                                                    <div className="space-y-4">
                                                        {/* Header with Avatar and Status */}
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                                                    {offer.applicant_name?.charAt(0).toUpperCase() || "?"}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                                                        {offer.applicant_name}
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500">{offer.name}</p>
                                                                </div>
                                                            </div>
                                                            <Badge className={`${getStatusColor(offer.status)} shadow-sm`}>
                                                                {offer.status}
                                                            </Badge>
                                                        </div>

                                                        {/* Divider */}
                                                        <div className="border-t border-slate-200"></div>

                                                        {/* Details */}
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-slate-500">Position</p>
                                                                    <p className="font-semibold text-sm text-slate-800 truncate">
                                                                        {offer.designation}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                                    <Building2 className="h-4 w-4 text-indigo-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-slate-500">Company</p>
                                                                    <p className="font-semibold text-sm text-slate-800 truncate">
                                                                        {offer.company}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-slate-500">Email</p>
                                                                    <p className="font-medium text-sm text-slate-700 truncate">
                                                                        {offer.applicant_email || "N/A"}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                                    <Calendar className="h-4 w-4 text-indigo-600" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-slate-500">Offer Date</p>
                                                                    <p className="font-medium text-sm text-slate-700">
                                                                        {offer.offer_date || "Not set"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Action Button */}
                                                        <Button
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                window.location.href = '/appointment'
                                                            }}
                                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                        >
                                                            <FileCheck className="h-4 w-4 mr-2" />
                                                            View Appointment Letter
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20">
                                        <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
                                            <FileText className="h-16 w-16 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                                            {searchQuery ? "No Matching Offers Found" : "No Offers Found"}
                                        </h3>
                                        <p className="text-slate-600">
                                            {searchQuery
                                                ? `No offers match "${searchQuery}". Try a different search term.`
                                                : "No job offers available yet. Check back later!"}
                                        </p>
                                        {searchQuery && (
                                            <Button
                                                onClick={() => setSearchQuery("")}
                                                variant="outline"
                                                className="mt-4"
                                            >
                                                Clear Search
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </>
                    ) : (
                        <>
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center space-x-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                                            <User className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-xl">Offer Details</span>
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedOffer(null)}
                                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to List
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Applicant Info Header */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                {selectedOffer.applicant_name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800">{selectedOffer.applicant_name}</h2>
                                                <p className="text-sm text-slate-500 mt-1">ID: {selectedOffer.name}</p>
                                            </div>
                                        </div>
                                        <Badge className={`${getStatusColor(selectedOffer.status)} shadow-md text-sm px-4 py-1`}>
                                            {selectedOffer.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Contact & Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-100 rounded-xl">
                                                    <Mail className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate mt-1">
                                                        {selectedOffer.applicant_email || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-indigo-50/30">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-indigo-100 rounded-xl">
                                                    <Briefcase className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-500 font-medium">Designation</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate mt-1">
                                                        {selectedOffer.designation || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-100 rounded-xl">
                                                    <Building2 className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-500 font-medium">Company</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate mt-1">
                                                        {selectedOffer.company || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-indigo-50/30">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-indigo-100 rounded-xl">
                                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-500 font-medium">Offer Date</p>
                                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                                        {selectedOffer.offer_date || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Template Info */}
                                {selectedOffer.job_offer_term_template && (
                                    <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-white rounded-xl shadow-sm">
                                                    <FileText className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-600 font-medium">Template Used</p>
                                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                                        {selectedOffer.job_offer_term_template}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Offer Terms */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                                            <FileCheck className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Offer Terms & Conditions</h3>
                                    </div>

                                    {selectedOffer.offer_terms?.length ? (
                                        <div className="space-y-3">
                                            {selectedOffer.offer_terms.map((term: any, idx: number) => (
                                                <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50/20">
                                                    <CardContent className="p-5">
                                                        <div className="flex gap-4">
                                                            <div className="flex-shrink-0">
                                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                                    {idx + 1}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <h4 className="font-bold text-slate-800">
                                                                    {term.offer_term}
                                                                </h4>
                                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                                    {term.value}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="border-0 shadow-md">
                                            <CardContent className="p-12">
                                                <div className="text-center">
                                                    <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
                                                        <FileText className="h-12 w-12 text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-600 font-medium">No offer terms available</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="pt-4">
                                    <Button
                                        size="lg"
                                        onClick={() => window.location.href = '/appointment'}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        <FileCheck className="h-5 w-5 mr-2" />
                                        View Appointment Letter
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    )
}
