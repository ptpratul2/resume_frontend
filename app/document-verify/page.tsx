"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Check, FileText, User, Briefcase, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { API_BASE_URL } from '@/lib/api-config'
import { useRouter } from "next/navigation"
import { axiosConfig } from '@/lib/axios-config'

interface JobApplicant {
    name: string
    applicant_name: string
}

interface Employee {
    name: string
    employee_name: string
}

interface ExistingDocument {
    name: string
    applicant_name: string
    employee: string
    aadhar_card: string | null
    passport: string | null
    experience: string | null
    education: string | null
    bank_details: string | null
    pan: string | null
    medical: string | null
    photos: string | null
}

export default function DocumentVerifyPage() {
    const router = useRouter()

    const [documentForm, setDocumentForm] = useState({
        applicantName: "",
        employee: "",
        aadharCard: null as File | null,
        passport: null as File | null,
        experience: null as File | null,
        education: null as File | null,
        bankDetails: null as File | null,
        pan: null as File | null,
        medical: null as File | null,
        photos: null as File | null,
    })

    const [existingDocumentId, setExistingDocumentId] = useState<string | null>(null)
    const [existingFiles, setExistingFiles] = useState<{ [key: string]: string }>({})
    const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [isSaving, setIsSaving] = useState(false)
    const [isLoadingExisting, setIsLoadingExisting] = useState(false)

    useEffect(() => {
        fetchJobApplicants()
        fetchEmployees()
    }, [])

    useEffect(() => {
        if (documentForm.applicantName) {
            fetchExistingDocument(documentForm.applicantName)
        } else {
            setExistingDocumentId(null)
            setExistingFiles({})
        }
    }, [documentForm.applicantName])

    const fetchJobApplicants = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Job Applicant?fields=["name","applicant_name","status"]&limit_page_length=999`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = await response.json()

            if (data && data.data) {
                setJobApplicants(data.data)
                console.log("Fetched job applicants:", data.data)
            }
        } catch (error) {
            console.error("Error fetching job applicants:", error)
        }
    }

    const fetchEmployees = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Employee?fields=["name","employee_name"]&limit_page_length=999`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = await response.json()

            if (data && data.data) {
                setEmployees(data.data)
                console.log("Fetched employees:", data.data)
            }
        } catch (error) {
            console.error("Error fetching employees:", error)
        }
    }

    const fetchExistingDocument = async (applicantName: string) => {
        setIsLoadingExisting(true)
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/resource/Applicant Document?filters=[["applicant_name","=","${applicantName}"]]&fields=["*"]&limit_page_length=1`,
                {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            const data = await response.json()

            if (data && data.data && data.data.length > 0) {
                const existingDoc = data.data[0] as ExistingDocument
                console.log("Found existing document:", existingDoc)

                setExistingDocumentId(existingDoc.name)

                const files: { [key: string]: string } = {}
                if (existingDoc.aadhar_card) files.aadharCard = existingDoc.aadhar_card
                if (existingDoc.passport) files.passport = existingDoc.passport
                if (existingDoc.experience) files.experience = existingDoc.experience
                if (existingDoc.education) files.education = existingDoc.education
                if (existingDoc.bank_details) files.bankDetails = existingDoc.bank_details
                if (existingDoc.pan) files.pan = existingDoc.pan
                if (existingDoc.medical) files.medical = existingDoc.medical
                if (existingDoc.photos) files.photos = existingDoc.photos

                setExistingFiles(files)

                if (existingDoc.employee) {
                    setDocumentForm(prev => ({ ...prev, employee: existingDoc.employee }))
                }
            } else {
                console.log("No existing document found for applicant")
                setExistingDocumentId(null)
                setExistingFiles({})
            }
        } catch (error) {
            console.error("Error fetching existing document:", error)
            setExistingDocumentId(null)
            setExistingFiles({})
        } finally {
            setIsLoadingExisting(false)
        }
    }

    const handleFileChange = (field: string, file: File | null) => {
        setDocumentForm((prev) => ({
            ...prev,
            [field]: file,
        }))
    }

    const handleRemoveFile = (field: string) => {
        setDocumentForm((prev) => ({
            ...prev,
            [field]: null,
        }))
    }

    const handleRemoveExistingFile = (field: string) => {
        setExistingFiles((prev) => {
            const newFiles = { ...prev }
            delete newFiles[field]
            return newFiles
        })
    }

    const uploadFile = async (file: File, filename: string): Promise<string | null> => {
        try {
            const formData = new FormData()
            formData.append("file", file, file.name)
            formData.append("is_private", "0")
            formData.append("doctype", "Applicant Document")
            formData.append("docname", existingDocumentId || "new-applicant-doc-1")
            formData.append("fieldname", filename)

            const response = await fetch(`${API_BASE_URL}/api/method/frappe.handler.upload_file`, {
                method: "POST",
                credentials: 'include',
                body: formData,
            })

            if (!response.ok) {
                console.error(`Upload failed for ${filename}:`, response.status)
                const errorData = await response.json()
                console.error("Error details:", errorData)
                return null
            }

            const data = await response.json()
            console.log(`File upload response for ${filename}:`, data)

            if (data && data.message && data.message.file_url) {
                return data.message.file_url
            }
            return null
        } catch (error) {
            console.error(`Error uploading file ${filename}:`, error)
            return null
        }
    }

    const handleSaveDocument = async () => {
        if (!documentForm.applicantName) {
            alert("Please select an applicant")
            return
        }

        const requiredDocs = [
            { field: 'aadharCard', name: 'Aadhar Card' },
            { field: 'experience', name: 'Experience' },
            { field: 'education', name: 'Education' },
            { field: 'bankDetails', name: 'Bank Details' },
            { field: 'pan', name: 'PAN' }
        ]

        const missingDocs = requiredDocs.filter(doc =>
            !existingFiles[doc.field] && !documentForm[doc.field as keyof typeof documentForm]
        )

        if (missingDocs.length > 0) {
            alert(`Please upload the following required documents:\n${missingDocs.map(d => d.name).join(", ")}`)
            return
        }

        setIsSaving(true)
        try {
            const fileUrls: { [key: string]: string | null } = { ...existingFiles }

            const fileFieldMap = {
                aadharCard: 'aadhar_card',
                passport: 'passport',
                experience: 'experience',
                education: 'education',
                bankDetails: 'bank_details',
                pan: 'pan',
                medical: 'medical',
                photos: 'photos'
            }

            for (const [formField, apiField] of Object.entries(fileFieldMap)) {
                const file = documentForm[formField as keyof typeof documentForm] as File | null

                if (file) {
                    console.log(`Uploading new ${formField}...`)
                    const url = await uploadFile(file, apiField)
                    if (url) {
                        fileUrls[formField] = url
                    } else {
                        if (requiredDocs.some(d => d.field === formField)) {
                            throw new Error(`Failed to upload ${formField}`)
                        }
                    }
                }
            }

            const apiFileUrls: { [key: string]: string | null } = {}
            for (const [formField, url] of Object.entries(fileUrls)) {
                const apiField = fileFieldMap[formField as keyof typeof fileFieldMap]
                if (apiField) {
                    apiFileUrls[apiField] = url
                }
            }

            const docData = {
                applicant_name: documentForm.applicantName,
                employee: documentForm.employee || "",
                ...apiFileUrls,
            }

            console.log("Document data to save:", docData)

            let response
            if (existingDocumentId) {
                console.log("Updating existing document:", existingDocumentId)
                response = await fetch(
                    `${API_BASE_URL}/api/resource/Applicant Document/${existingDocumentId}`,
                    {
                        method: "PUT",
                        headers: {
                            Authorization: `token 09481bf19b467f7:39bb84748d00090`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(docData),
                    }
                )
            } else {
                console.log("Creating new document")
                response = await fetch(`${API_BASE_URL}/api/resource/Applicant Document`, {
                    method: "POST",
                    headers: {
                        Authorization: `token 09481bf19b467f7:39bb84748d00090`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(docData),
                })
            }

            const data = await response.json()
            console.log("API Response:", data)

            if (data && data.data) {
                alert(existingDocumentId
                    ? "Document verification updated successfully!"
                    : "Document verification created successfully!")
                router.push('/document-verify-list')
            } else {
                throw new Error(data.exception || data._server_messages || "Failed to save document")
            }
        } catch (error) {
            console.error("Error saving document:", error)
            alert(`Failed to save document verification: ${error}`)
        } finally {
            setIsSaving(false)
        }
    }

    const FileUploadField = ({
        label,
        field,
        required = false
    }: {
        label: string
        field: keyof typeof documentForm
        required?: boolean
    }) => {
        const newFile = documentForm[field] as File | null
        const existingFile = existingFiles[field as string]
        const hasFile = newFile || existingFile

        return (
            <div className="space-y-2">
                <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    {label} {required && <span className="text-red-500">*</span>}
                </Label>
                <div className="border-2 border-dashed rounded-lg p-4 hover:border-blue-400 transition-colors shadow-sm">
                    {hasFile ? (
                        <div className="space-y-2">
                            {existingFile && !newFile && (
                                <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                                            <Check className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">
                                                Already Uploaded
                                            </span>
                                            <a
                                                href={`${API_BASE_URL}${existingFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-600 hover:underline font-medium"
                                            >
                                                View Document →
                                            </a>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveExistingFile(field as string)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}

                            {newFile && (
                                <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                            <Upload className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">{newFile.name}</span>
                                            <span className="text-xs text-gray-600">
                                                {(newFile.size / 1024).toFixed(2)} KB
                                                {existingFile && <span className="text-blue-600 font-medium"> (Will replace existing)</span>}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveFile(field as string)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer py-4 group">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-2 shadow-md group-hover:shadow-lg transition-shadow">
                                <Upload className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Attach Document</span>
                            <span className="text-xs text-gray-500 mt-1">Click to upload file</span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                    const selectedFile = e.target.files?.[0]
                                    if (selectedFile) {
                                        handleFileChange(field as string, selectedFile)
                                    }
                                }}
                            />
                        </label>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="container mx-auto p-6 lg:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.back()}
                                className="shadow-sm hover:shadow-md transition-shadow"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {existingDocumentId ? "Update Documents" : "Applicant Documents"}
                            </h1>
                        </div>
                        <p className="text-sm text-muted-foreground ml-[92px]">
                            {existingDocumentId
                                ? "Update or add missing applicant documents"
                                : "Verify and upload applicant documents"}
                        </p>
                    </div>
                    <Button
                        onClick={handleSaveDocument}
                        disabled={isSaving || isLoadingExisting}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 h-11 shadow-lg hover:shadow-xl transition-all"
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {existingDocumentId ? "Update Documents" : "Save Documents"}
                            </span>
                        )}
                    </Button>
                </div>

                <div className="max-w-6xl mx-auto space-y-6">
                    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-600" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            {isLoadingExisting && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                                    <span className="text-sm font-medium text-blue-800">Loading existing documents...</span>
                                </div>
                            )}

                            {existingDocumentId && !isLoadingExisting && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">
                                        Existing document found. You can upload missing documents or replace existing ones.
                                    </span>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-blue-500" />
                                        Applicant Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={documentForm.applicantName}
                                        onValueChange={(value) =>
                                            setDocumentForm({ ...documentForm, applicantName: value })
                                        }
                                        disabled={isLoadingExisting}
                                    >
                                        <SelectTrigger className="h-11 shadow-sm">
                                            <SelectValue placeholder="Select applicant" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {jobApplicants.map((applicant) => (
                                                <SelectItem key={applicant.name} value={applicant.name}>
                                                    {applicant.applicant_name || applicant.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-blue-500" />
                                        Employee
                                    </Label>
                                    <Select
                                        value={documentForm.employee}
                                        onValueChange={(value) =>
                                            setDocumentForm({ ...documentForm, employee: value })
                                        }
                                        disabled={isLoadingExisting}
                                    >
                                        <SelectTrigger className="h-11 shadow-sm">
                                            <SelectValue placeholder="Select employee (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem key={employee.name} value={employee.name}>
                                                    {employee.employee_name || employee.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Identity & Experience
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <FileUploadField label="Aadhar Card" field="aadharCard" required />
                                <FileUploadField label="Passport" field="passport" />
                                <FileUploadField label="Experience Certificate" field="experience" required />
                                <FileUploadField label="Education Certificate" field="education" required />
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Financial & Medical
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <FileUploadField label="Bank Account Details" field="bankDetails" required />
                                <FileUploadField label="PAN Card" field="pan" required />
                                <FileUploadField label="Medical Certificate" field="medical" />
                                <FileUploadField label="Passport Photos" field="photos" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
