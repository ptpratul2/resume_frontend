"use client"
import { useEffect, useState } from "react"
import {
    Briefcase,
    Building,
    MapPin,
    Calendar,
    DollarSign,
    Search,
    Filter,
    Users,
    TrendingUp,
    Clock,
    X,
    ChevronDown
} from "lucide-react"
import { API_BASE_URL } from '@/lib/api-config'

interface JobOpening {
    name: string
    job_title: string
    designation: string
    company: string
    department: string
    location: string
    employment_type: string
    status: string
    posted_on: string
    closes_on: string
    currency: string
    lower_range: number
    upper_range: number
    salary_per: string
    description: string
    publish_salary_range: number
    publish_on_website: number
}

export default function JobOpeningList() {
    const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([])
    const [filteredJobs, setFilteredJobs] = useState<JobOpening[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [companyFilter, setCompanyFilter] = useState("all")
    const [selectedJob, setSelectedJob] = useState<JobOpening | null>(null)
    const [showStatusDropdown, setShowStatusDropdown] = useState(false)
    const [showCompanyDropdown, setShowCompanyDropdown] = useState(false)

    const fetchJobOpenings = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Job Opening?fields=["*"]&limit_page_length=999`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            )

            const data = await response.json()
            const jobs = data.data || []
            setJobOpenings(jobs)
            setFilteredJobs(jobs)
        } catch (error) {
            console.error("Error fetching job openings:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchJobOpenings()
    }, [])

    useEffect(() => {
        let filtered = jobOpenings

        if (searchTerm) {
            filtered = filtered.filter(
                (job) =>
                    job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((job) => job.status === statusFilter)
        }

        if (companyFilter !== "all") {
            filtered = filtered.filter((job) => job.company === companyFilter)
        }

        setFilteredJobs(filtered)
    }, [searchTerm, statusFilter, companyFilter, jobOpenings])

    const getStatusColor = (status) => {
        switch (status) {
            case "Open":
                return "bg-green-100 text-green-800 border border-green-200"
            case "Closed":
                return "bg-red-100 text-red-800 border border-red-200"
            case "On Hold":
                return "bg-yellow-100 text-yellow-800 border border-yellow-200"
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200"
        }
    }

    const getUniqueCompanies = () => {
        const companies = jobOpenings.map((job) => job.company).filter(Boolean)
        return [...new Set(companies)]
    }

    const getStats = () => {
        const open = jobOpenings.filter((job) => job.status === "Open").length
        const closed = jobOpenings.filter((job) => job.status === "Closed").length
        const onHold = jobOpenings.filter((job) => job.status === "On Hold").length
        return { open, closed, onHold, total: jobOpenings.length }
    }

    const stats = getStats()

    const formatSalaryRange = (job) => {
        if (!job.lower_range || !job.upper_range) return "Not Specified"
        const currency = job.currency || "INR"
        const per = job.salary_per || "Month"
        return `${currency} ${job.lower_range.toLocaleString()} - ${job.upper_range.toLocaleString()} / ${per}`
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Not Set"
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
    }

    const isClosingSoon = (closesOn) => {
        if (!closesOn) return false
        const closeDate = new Date(closesOn)
        const today = new Date()
        const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return daysUntilClose <= 7 && daysUntilClose >= 0
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="text-lg font-medium text-gray-600">Loading Job Openings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Side - List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                                Job Openings
                            </h1>
                            <p className="text-gray-600">Manage and track all your recruitment positions</p>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Total</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Briefcase className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Open</p>
                                        <p className="text-2xl font-bold text-green-600">{stats.open}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">On Hold</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.onHold}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <Clock className="h-5 w-5 text-yellow-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-600">Closed</p>
                                        <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
                                    </div>
                                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <Users className="h-5 w-5 text-red-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="border-0 shadow-xl bg-white/80 backdrop-blur-sm rounded-lg p-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by job title, designation, company, or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 h-12 border-0 bg-slate-50 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm("")}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="bg-white rounded-lg shadow-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowStatusDropdown(!showStatusDropdown)
                                            setShowCompanyDropdown(false)
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <Filter className="h-4 w-4 mr-2 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">{statusFilter === "all" ? "All Statuses" : statusFilter}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showStatusDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                                            <div
                                                onClick={() => { setStatusFilter("all"); setShowStatusDropdown(false); }}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors"
                                            >
                                                All Statuses
                                            </div>
                                            <div
                                                onClick={() => { setStatusFilter("Open"); setShowStatusDropdown(false); }}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors border-t border-gray-100"
                                            >
                                                Open
                                            </div>
                                            <div
                                                onClick={() => { setStatusFilter("Closed"); setShowStatusDropdown(false); }}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors border-t border-gray-100"
                                            >
                                                Closed
                                            </div>
                                            <div
                                                onClick={() => { setStatusFilter("On Hold"); setShowStatusDropdown(false); }}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors border-t border-gray-100"
                                            >
                                                On Hold
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={() => {
                                            setShowCompanyDropdown(!showCompanyDropdown)
                                            setShowStatusDropdown(false)
                                        }}
                                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center min-w-0 flex-1">
                                            <Building className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-700 truncate">{companyFilter === "all" ? "All Companies" : companyFilter}</span>
                                        </div>
                                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ml-2 ${showCompanyDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    {showCompanyDropdown && (
                                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                            <div
                                                onClick={() => { setCompanyFilter("all"); setShowCompanyDropdown(false); }}
                                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors"
                                            >
                                                All Companies
                                            </div>
                                            {getUniqueCompanies().map((company, index) => (
                                                <div
                                                    key={company}
                                                    onClick={() => { setCompanyFilter(company); setShowCompanyDropdown(false); }}
                                                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer text-sm font-medium text-gray-700 transition-colors ${index > 0 ? 'border-t border-gray-100' : ''}`}
                                                >
                                                    {company}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Job List */}
                        <div className="space-y-3">
                            {filteredJobs.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                                    <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
                                        <Briefcase className="h-16 w-16 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2">No Job Openings Found</h3>
                                    <p className="text-slate-600">Try adjusting your filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.name}
                                            onClick={() => setSelectedJob(job)}
                                            className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30 cursor-pointer rounded-lg ${selectedJob?.name === job.name ? 'ring-2 ring-blue-500' : ''
                                                }`}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                                            <div className="p-6 relative z-10">
                                                <div className="space-y-4">
                                                    {/* Header with Avatar and Status */}
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                                                <Briefcase className="h-6 w-6" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">
                                                                    {job.job_title}
                                                                </h3>
                                                                <p className="text-xs text-slate-500">{job.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(job.status)}`}>
                                                                {job.status}
                                                            </span>
                                                            {isClosingSoon(job.closes_on) && (
                                                                <span className="text-xs px-2 py-1 rounded-md font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                                    Closing Soon
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="border-t border-slate-200"></div>

                                                    {/* Details */}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <Users className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-slate-500">Designation</p>
                                                                <p className="font-medium text-sm text-slate-700 truncate">
                                                                    {job.designation || "Not Set"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                            <div className="p-2 bg-indigo-100 rounded-lg">
                                                                <Building className="h-4 w-4 text-indigo-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-slate-500">Company</p>
                                                                <p className="font-medium text-sm text-slate-700 truncate">
                                                                    {job.company || "Not Set"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                                                            <div className="p-2 bg-red-100 rounded-lg">
                                                                <MapPin className="h-4 w-4 text-red-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs text-slate-500">Location</p>
                                                                <p className="font-medium text-sm text-slate-700 truncate">
                                                                    {job.location || "Not Set"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="border-t border-slate-200"></div>

                                                    {/* Footer */}
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-blue-600" />
                                                            <span>Posted: {formatDate(job.posted_on)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-red-600" />
                                                            <span>Closes: {formatDate(job.closes_on)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {filteredJobs.length > 0 && (
                            <div className="text-center text-sm text-gray-600">
                                Showing {filteredJobs.length} of {jobOpenings.length} job opening(s)
                            </div>
                        )}
                    </div>

                    {/* Right Side - Details Panel */}
                    <div className="lg:col-span-1">
                        {selectedJob ? (
                            <div className="bg-white rounded-lg shadow-lg sticky top-8">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                                        <button
                                            onClick={() => setSelectedJob(null)}
                                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-2xl font-bold text-gray-900">{selectedJob.job_title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(selectedJob.status)}`}>
                                                    {selectedJob.status}
                                                </span>
                                                {isClosingSoon(selectedJob.closes_on) && (
                                                    <span className="text-xs px-2 py-1 rounded-md font-medium bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        Closing Soon
                                                    </span>
                                                )}
                                                {selectedJob.publish_on_website === 1 && (
                                                    <span className="text-xs px-2 py-1 rounded-md font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                        Published
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">ID: {selectedJob.name}</p>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Users className="h-4 w-4 text-blue-600" />
                                                    <span className="text-xs font-medium">Designation</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {selectedJob.designation || "Not Set"}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Building className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs font-medium">Company</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {selectedJob.company || "Not Set"}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <MapPin className="h-4 w-4 text-red-600" />
                                                    <span className="text-xs font-medium">Location</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {selectedJob.location || "Not Set"}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Briefcase className="h-4 w-4 text-purple-600" />
                                                    <span className="text-xs font-medium">Employment Type</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {selectedJob.employment_type || "Not Set"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <DollarSign className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs font-medium">Salary Range</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {formatSalaryRange(selectedJob)}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Calendar className="h-4 w-4 text-blue-600" />
                                                    <span className="text-xs font-medium">Posted On</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {formatDate(selectedJob.posted_on)}
                                                </p>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                                    <Calendar className="h-4 w-4 text-red-600" />
                                                    <span className="text-xs font-medium">Closes On</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-900 ml-6">
                                                    {formatDate(selectedJob.closes_on)}
                                                </p>
                                            </div>
                                        </div>

                                        {selectedJob.description && (
                                            <div className="pt-4 border-t border-gray-200">
                                                <p className="text-xs font-medium text-gray-600 mb-2">Description</p>
                                                <p className="text-sm text-gray-700">{selectedJob.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-lg sticky top-8">
                                <div className="p-12 text-center">
                                    <div className="inline-block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full mb-6">
                                        <Briefcase className="h-16 w-16 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-800 mb-2">Select a Job Opening</h3>
                                    <p className="text-slate-600">Click on any job opening to view its details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

