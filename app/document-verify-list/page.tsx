
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Plus,
    Search,
    FileText,
    User,
    Calendar,
    Eye,
    Trash2,
    Download,
    Mail,
    Briefcase,
    CheckCircle2,
    XCircle,
    ArrowLeft
} from "lucide-react"
import { useRouter } from "next/navigation"
import { API_BASE_URL } from '@/lib/api-config'
import axiosInstance from '@/lib/axios-instance'
import { useCSRFToken } from '@/lib/use-csrf-token'

interface ApplicantDocument {
    name: string
    applicant_name: string
    employee: string
    creation: string
    modified: string
    aadhar_card: string
    passport: string
    experience: string
    education: string
    bank_details: string
    pan: string
    medical: string
    photos: string
    applicant_details?: {
        applicant_name: string
        email_id: string
    }
    employee_details?: {
        employee_name: string
        personal_email: string
    }
}

export default function DocumentVerifyListPage() {
    const router = useRouter()
    const [documents, setDocuments] = useState<ApplicantDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedDoc, setSelectedDoc] = useState<ApplicantDocument | null>(null)

    const { token: csrfToken, loading: csrfLoading } = useCSRFToken()


    useEffect(() => {
        if (csrfLoading) return;  // ADD THIS
        fetchDocuments()
    }, [csrfLoading])

    // const fetchDocuments = async () => {
    //     setLoading(true)
    //     try {
    //         const response = await fetch(
    //             `${API_BASE_URL}/api/resource/Applicant Document?fields=["*"]&limit_page_length=999`,
    //             {
    //                 credentials: 'include',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             }
    //         )
    //         const data = await response.json()

    //         if (data && data.data) {
    //             const documentsWithDetails = await Promise.all(
    //                 data.data.map(async (doc: ApplicantDocument) => {
    //                     if (doc.applicant_name) {
    //                         try {
    //                             const applicantResponse = await fetch(
    //                                 `${API_BASE_URL}/api/resource/Job Applicant/${doc.applicant_name}`,
    //                                 {
    //                                     credentials: 'include',
    //                                     headers: {
    //                                         'Content-Type': 'application/json',
    //                                     },
    //                                 }
    //                             )
    //                             const applicantData = await applicantResponse.json()
    //                             doc.applicant_details = applicantData.data
    //                         } catch (error) {
    //                             console.error("Error fetching applicant details:", error)
    //                         }
    //                     }

    //                     if (doc.employee) {
    //                         try {
    //                             const employeeResponse = await fetch(
    //                                 `${API_BASE_URL}/api/resource/Employee/${doc.employee}`,
    //                                 {
    //                                     credentials: 'include',
    //                                     headers: {
    //                                         'Content-Type': 'application/json',
    //                                     },
    //                                 }
    //                             )
    //                             const employeeData = await employeeResponse.json()
    //                             doc.employee_details = employeeData.data
    //                         } catch (error) {
    //                             console.error("Error fetching employee details:", error)
    //                         }
    //                     }

    //                     return doc
    //                 })
    //             )
    //             setDocuments(documentsWithDetails)
    //         }
    //     } catch (error) {
    //         console.error("Error fetching documents:", error)
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const fetchDocuments = async () => {
        if (csrfLoading) return;  // ADD THIS
        setLoading(true)
        try {
            const response = await axiosInstance.get(
                `${API_BASE_URL}/api/resource/Applicant Document?fields=["*"]&limit_page_length=999`
            )
            const data = response.data

            if (data && data.data) {
                const documentsWithDetails = await Promise.all(
                    data.data.map(async (doc: ApplicantDocument) => {
                        if (doc.applicant_name) {
                            try {
                                const applicantResponse = await axiosInstance.get(
                                    `/api/resource/Job Applicant/${doc.applicant_name}`
                                )
                                const applicantData = applicantResponse.data
                                doc.applicant_details = applicantData.data
                            } catch (error) {
                                console.error("Error fetching applicant details:", error)
                            }
                        }

                        if (doc.employee) {
                            try {
                                const employeeResponse = await axiosInstance.get(
                                    `${API_BASE_URL}/api/resource/Employee/${doc.employee}`
                                )
                                const employeeData = employeeResponse.data
                                doc.employee_details = employeeData.data
                            } catch (error) {
                                console.error("Error fetching employee details:", error)
                            }
                        }

                        return doc
                    })
                )
                setDocuments(documentsWithDetails)
            }
        } catch (error) {
            console.error("Error fetching documents:", error)
        } finally {
            setLoading(false)
        }
    }

    // const handleDelete = async (name: string) => {
    //     if (!confirm("Are you sure you want to delete this document?")) {
    //         return
    //     }

    //     try {
    //         const response = await fetch(
    //             `${API_BASE_URL}/api/resource/Applicant Document/${name}`,
    //             {
    //                 method: "DELETE",
    //                 credentials: 'include',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             }
    //         )

    //         if (response.ok) {
    //             alert("Document deleted successfully!")
    //             fetchDocuments()
    //         } else {
    //             alert("Failed to delete document")
    //         }
    //     } catch (error) {
    //         console.error("Error deleting document:", error)
    //         alert("Failed to delete document")
    //     }
    // }
    const handleDelete = async (name: string) => {
        if (!confirm("Are you sure you want to delete this document?")) {
            return
        }

        try {
            const response = await axiosInstance.delete(
                `/api/resource/Applicant Document/${name}`
            )

            if (response.status === 200) {
                alert("Document deleted successfully!")
                fetchDocuments()
            } else {
                alert("Failed to delete document")
            }
        } catch (error) {
            console.error("Error deleting document:", error)
            alert("Failed to delete document")
        }
    }

    const filteredDocuments = documents.filter((doc) => {
        const searchLower = searchQuery.toLowerCase()
        return (
            doc.name.toLowerCase().includes(searchLower) ||
            doc.applicant_details?.applicant_name?.toLowerCase().includes(searchLower) ||
            doc.employee_details?.employee_name?.toLowerCase().includes(searchLower)
        )
    })

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const countDocuments = (doc: ApplicantDocument) => {
        let count = 0
        if (doc.aadhar_card) count++
        if (doc.passport) count++
        if (doc.experience) count++
        if (doc.education) count++
        if (doc.bank_details) count++
        if (doc.pan) count++
        if (doc.medical) count++
        if (doc.photos) count++
        return count
    }

    const getCompletionPercentage = (doc: ApplicantDocument) => {
        const total = 8
        const completed = countDocuments(doc)
        return Math.round((completed / total) * 100)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg font-medium text-slate-600">Loading documents...</p>
                </div>
            </div>
        )
    }

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
                            Document Verification
                        </h1>
                        <p className="text-slate-600">Manage and verify applicant documentation</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Documents</p>
                                    <p className="text-4xl font-bold mt-2">{documents.length}</p>
                                </div>
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <FileText className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium">Applicants</p>
                                    <p className="text-4xl font-bold mt-2">
                                        {new Set(documents.map(d => d.applicant_name)).size}
                                    </p>
                                </div>
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <User className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">This Month</p>
                                    <p className="text-4xl font-bold mt-2">
                                        {documents.filter(d => {
                                            const docDate = new Date(d.creation)
                                            const now = new Date()
                                            return docDate.getMonth() === now.getMonth() &&
                                                docDate.getFullYear() === now.getFullYear()
                                        }).length}
                                    </p>
                                </div>
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                    <Calendar className="h-8 w-8" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search Card */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by applicant name, document ID, or employee..."
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

                {/* Main Content */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    {!selectedDoc ? (
                        <>
                            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                                <CardTitle className="flex items-center space-x-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xl">All Documents</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {filteredDocuments.length === 0 ? (
                                    <div className="text-center py-20">
                                        <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
                                            <FileText className="h-16 w-16 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Documents Found</h3>
                                        <p className="text-slate-600">No applicant documents available yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {filteredDocuments.map((doc) => {
                                            const percentage = getCompletionPercentage(doc)
                                            return (
                                                <Card
                                                    key={doc.name}
                                                    className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 cursor-pointer"
                                                    onClick={() => setSelectedDoc(doc)}
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                                                    <CardContent className="p-6 relative z-10">
                                                        <div className="space-y-4">
                                                            {/* Header */}
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                                                        {doc.applicant_details?.applicant_name?.charAt(0).toUpperCase() || "?"}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                                                            {doc.applicant_details?.applicant_name || doc.applicant_name}
                                                                        </h3>
                                                                        <p className="text-xs text-slate-500">{doc.name}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Progress Bar */}
                                                            <div className="space-y-2">
                                                                <div className="flex items-center justify-between text-sm">
                                                                    <span className="text-slate-600 font-medium">Completion</span>
                                                                    <span className="font-bold text-slate-800">{percentage}%</span>
                                                                </div>
                                                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                                <p className="text-xs text-slate-500">
                                                                    {countDocuments(doc)} of 8 documents uploaded
                                                                </p>
                                                            </div>

                                                            {/* Divider */}
                                                            <div className="border-t border-slate-200"></div>

                                                            {/* Details */}
                                                            <div className="space-y-3">
                                                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                                        <Mail className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs text-slate-500">Email</p>
                                                                        <p className="font-medium text-sm text-slate-700 truncate">
                                                                            {doc.applicant_details?.email_id || "N/A"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                                                        <Briefcase className="h-4 w-4 text-indigo-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs text-slate-500">Employee</p>
                                                                        <p className="font-medium text-sm text-slate-700 truncate">
                                                                            {doc.employee_details?.employee_name || "Not Assigned"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                                        <Calendar className="h-4 w-4 text-blue-600" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs text-slate-500">Last Modified</p>
                                                                        <p className="font-medium text-sm text-slate-700">
                                                                            {formatDate(doc.modified)}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action Button */}
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    setSelectedDoc(doc)
                                                                }}
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                View Details
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )
                                        })}
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
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-xl">Document Details</span>
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedDoc(null)}
                                        className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to List
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Applicant Header */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                                {selectedDoc.applicant_details?.applicant_name?.charAt(0).toUpperCase() || "?"}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-800">
                                                    {selectedDoc.applicant_details?.applicant_name || selectedDoc.applicant_name}
                                                </h2>
                                                <p className="text-sm text-slate-500 mt-1">ID: {selectedDoc.name}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm px-4 py-2">
                                            {countDocuments(selectedDoc)} / 8 Documents
                                        </Badge>
                                    </div>
                                </div>

                                {/* Info Cards */}
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
                                                        {selectedDoc.applicant_details?.email_id || "-"}
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
                                                    <p className="text-xs text-slate-500 font-medium">Employee</p>
                                                    <p className="text-sm font-semibold text-slate-800 truncate mt-1">
                                                        {selectedDoc.employee_details?.employee_name || "Not Assigned"}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-100 rounded-xl">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-slate-500 font-medium">Created Date</p>
                                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                                        {formatDate(selectedDoc.creation)}
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
                                                    <p className="text-xs text-slate-500 font-medium">Modified Date</p>
                                                    <p className="text-sm font-semibold text-slate-800 mt-1">
                                                        {formatDate(selectedDoc.modified)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Document Status */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
                                            <FileText className="h-5 w-5 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800">Document Status</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { label: "Aadhar Card", value: selectedDoc.aadhar_card, icon: FileText },
                                            { label: "PAN Card", value: selectedDoc.pan, icon: FileText },
                                            { label: "Passport", value: selectedDoc.passport, icon: FileText },
                                            { label: "Experience Letter", value: selectedDoc.experience, icon: Briefcase },
                                            { label: "Education Certificate", value: selectedDoc.education, icon: FileText },
                                            { label: "Bank Details", value: selectedDoc.bank_details, icon: FileText },
                                            { label: "Medical Certificate", value: selectedDoc.medical, icon: FileText },
                                            { label: "Photos", value: selectedDoc.photos, icon: User },
                                        ].map((item) => (
                                            <Card
                                                key={item.label}
                                                className={`border-0 shadow-md transition-all ${item.value
                                                    ? "bg-gradient-to-br from-green-50 to-emerald-50"
                                                    : "bg-gradient-to-br from-slate-50 to-slate-100"
                                                    }`}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-lg ${item.value ? "bg-green-100" : "bg-slate-200"
                                                                }`}>
                                                                <item.icon className={`h-4 w-4 ${item.value ? "text-green-600" : "text-slate-400"
                                                                    }`} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {item.label}
                                                                </p>
                                                                <p className={`text-xs font-medium mt-1 ${item.value ? "text-green-600" : "text-slate-500"
                                                                    }`}>
                                                                    {item.value ? "Uploaded" : "Not Uploaded"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {item.value ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                        ) : (
                                                            <XCircle className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    )
}
