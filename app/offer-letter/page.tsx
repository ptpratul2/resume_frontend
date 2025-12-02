"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { axiosConfig } from '@/lib/axios-config'
import { ArrowLeft, FileText, Mail, Calendar, Briefcase, Building2, Plus, Trash2, User, CheckCircle2, AlertCircle } from "lucide-react"

import { API_BASE_URL } from '@/lib/api-config'
const API_MODULE_PATH = "resume.api.offer_letter"

interface JobApplicant {
  name: string
  applicant_name: string
  email_id: string
}

interface JobOfferTemplate {
  name: string
  offer_term_template_name?: string
}

interface Company {
  name: string
  company_name: string
}

interface Designation {
  name: string
  designation_name: string
}

interface OfferTerm {
  id: string
  offer_term: string
  value_description: string
}

export default function JobOfferPage() {
  const router = useRouter()
  const [offerForm, setOfferForm] = useState({
    jobApplicant: "",
    applicantName: "",
    applicantEmail: "",
    status: "Awaiting Response",
    offerDate: "",
    designation: "",
    company: "",
    jobOfferTemplate: "",
  })

  const [offerTerms, setOfferTerms] = useState<OfferTerm[]>([])
  const [jobApplicants, setJobApplicants] = useState<JobApplicant[]>([])
  const [templates, setTemplates] = useState<JobOfferTemplate[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [designations, setDesignations] = useState<Designation[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState({
    applicants: true,
    templates: true,
    companies: true,
    designations: true
  })

  const statusOptions = [
    "Awaiting Response",
    "Accepted",
    "Rejected",
    "Pending"
  ]

  useEffect(() => {
    fetchJobApplicants()
    fetchTemplates()
    fetchCompanies()
    fetchDesignations()
  }, [])

  useEffect(() => {
    if (offerForm.jobOfferTemplate) {
      fetchTemplateTerms(offerForm.jobOfferTemplate);
    }
  }, [offerForm.jobOfferTemplate]);

  const fetchJobApplicants = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/method/${API_MODULE_PATH}.get_job_applicants`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.json()

      const data = result?.message?.data || []
      setJobApplicants(data)
      console.log("✅ Fetched job applicants:", data.length)
    } catch (error: any) {
      console.error("❌ Error fetching job applicants:", error)
      setJobApplicants([])
    } finally {
      setLoading(prev => ({ ...prev, applicants: false }))
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/method/${API_MODULE_PATH}.get_job_offer_templates`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.json()

      const data = result?.message?.data || []
      setTemplates(data)
      console.log("✅ Fetched templates:", data.length)
    } catch (error: any) {
      console.warn("⚠️ Templates not available:", error.message)
      setTemplates([])
    } finally {
      setLoading(prev => ({ ...prev, templates: false }))
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/method/${API_MODULE_PATH}.get_companies`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.json()

      const data = result?.message?.data || []
      setCompanies(data)
      console.log("✅ Fetched companies:", data.length)
    } catch (error: any) {
      console.error("❌ Error fetching companies:", error)
      setCompanies([])
    } finally {
      setLoading(prev => ({ ...prev, companies: false }))
    }
  }

  const fetchDesignations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/method/${API_MODULE_PATH}.get_designations`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.json()

      const data = result?.message?.data || []
      setDesignations(data)
      console.log("✅ Fetched designations:", data.length)
    } catch (error: any) {
      console.error("❌ Error fetching designations:", error)
      setDesignations([])
    } finally {
      setLoading(prev => ({ ...prev, designations: false }))
    }
  }

  const fetchTemplateTerms = async (templateName: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/method/${API_MODULE_PATH}.get_template_terms?template_name=${templateName}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      const result = await response.json()

      const terms = result?.message?.data || []
      const formattedTerms = terms.map((term: any, index: number) => ({
        id: Date.now().toString() + index,
        offer_term: term.offer_term || "",
        value_description: term.value || ""
      }))

      setOfferTerms(formattedTerms)
      console.log("✅ Fetched template terms:", formattedTerms.length)
    } catch (error: any) {
      console.error("❌ Error fetching template terms:", error)
    }
  }

  const handleJobApplicantChange = (value: string) => {
    const applicant = jobApplicants.find(a => a.name === value)
    if (applicant) {
      setOfferForm({
        ...offerForm,
        jobApplicant: value,
        applicantName: applicant.applicant_name || "",
        applicantEmail: applicant.email_id || ""
      })
    }
  }

  const addOfferTerm = () => {
    const newTerm: OfferTerm = {
      id: Date.now().toString(),
      offer_term: "",
      value_description: ""
    }
    setOfferTerms([...offerTerms, newTerm])
  }

  const removeOfferTerm = (id: string) => {
    setOfferTerms(offerTerms.filter(term => term.id !== id))
  }

  const updateOfferTerm = (id: string, field: keyof OfferTerm, value: string) => {
    setOfferTerms(offerTerms.map(term =>
      term.id === id ? { ...term, [field]: value } : term
    ))
  }

  const handleSave = async () => {
    if (!offerForm.jobApplicant || !offerForm.applicantName || !offerForm.designation || !offerForm.company) {
      alert("Please fill all required fields")
      return
    }

    setIsSaving(true)
    try {
      const formData = new URLSearchParams()
      formData.append('job_applicant', offerForm.jobApplicant)
      formData.append('applicant_name', offerForm.applicantName)
      if (offerForm.applicantEmail) formData.append('applicant_email', offerForm.applicantEmail)
      if (offerForm.offerDate) formData.append('offer_date', offerForm.offerDate)
      formData.append('designation', offerForm.designation)
      formData.append('company', offerForm.company)
      formData.append('status', offerForm.status)
      if (offerForm.jobOfferTemplate) formData.append('job_offer_template', offerForm.jobOfferTemplate)

      if (offerTerms.length > 0) {
        formData.append('offer_terms', JSON.stringify(offerTerms))
      }

      console.log("Submitting job offer with data:", Object.fromEntries(formData))

      const response = await fetch(
        `${API_BASE_URL}/api/method/${API_MODULE_PATH}.create_job_offer`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        }
      )

      const result = await response.json()
      const message = result?.message?.message || "Job Offer created successfully!"
      alert(message)
      router.push('/offer-list')
    } catch (error: any) {
      console.error("Error creating job offer:", error)
      alert(error.message || "Failed to create job offer")
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Accepted": return "bg-green-500"
      case "Rejected": return "bg-red-500"
      case "Awaiting Response": return "bg-blue-500"
      case "Pending": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 lg:p-8 space-y-6">
        {/* Header */}
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
                Create Job Offer
              </h1>
            </div>
            <p className="text-sm text-muted-foreground ml-[92px]">Generate and send job offers to selected candidates</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Main Details Card */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Offer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Job Applicant <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={offerForm.jobApplicant}
                    onValueChange={handleJobApplicantChange}
                    disabled={loading.applicants}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue placeholder={
                        loading.applicants ? "Loading applicants..." :
                          jobApplicants.length === 0 ? "No applicants found" :
                            "Select an applicant"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {jobApplicants.map((applicant) => (
                        <SelectItem key={applicant.name} value={applicant.name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{applicant.applicant_name}</span>
                            <span className="text-xs text-gray-500">{applicant.email_id}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Badge variant="outline" className="h-4 w-4 rounded-full p-0 border-2 border-blue-500" />
                    Status <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={offerForm.status}
                    onValueChange={(value) => setOfferForm({ ...offerForm, status: value })}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${getStatusColor(status)}`} />
                            {status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-500" />
                    Applicant Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={offerForm.applicantName}
                    onChange={(e) => setOfferForm({ ...offerForm, applicantName: e.target.value })}
                    placeholder="Full name of applicant"
                    disabled={!!offerForm.jobApplicant}
                    className="h-11 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    Offer Date
                  </Label>
                  <Input
                    type="date"
                    value={offerForm.offerDate}
                    onChange={(e) => setOfferForm({ ...offerForm, offerDate: e.target.value })}
                    className="h-11 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Applicant Email Address
                  </Label>
                  <Input
                    type="email"
                    value={offerForm.applicantEmail}
                    onChange={(e) => setOfferForm({ ...offerForm, applicantEmail: e.target.value })}
                    placeholder="email@example.com"
                    disabled={!!offerForm.jobApplicant}
                    className="h-11 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    Designation <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={offerForm.designation}
                    onValueChange={(value) => setOfferForm({ ...offerForm, designation: value })}
                    disabled={loading.designations}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue placeholder={
                        loading.designations ? "Loading designations..." :
                          designations.length === 0 ? "No designations found" :
                            "Select designation"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {designations.map((designation) => (
                        <SelectItem key={designation.name} value={designation.name}>
                          {designation.designation_name || designation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Job Offer Term Template
                  </Label>
                  <Select
                    value={offerForm.jobOfferTemplate}
                    onValueChange={(value) => setOfferForm({ ...offerForm, jobOfferTemplate: value })}
                    disabled={loading.templates || templates.length === 0}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue placeholder={
                        loading.templates ? "Loading templates..." :
                          templates.length === 0 ? "No templates available" :
                            "Select template (optional)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.name} value={template.name}>
                          {template.offer_term_template_name || template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {offerForm.jobOfferTemplate && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Template terms will be loaded automatically
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={offerForm.company}
                    onValueChange={(value) => setOfferForm({ ...offerForm, company: value })}
                    disabled={loading.companies}
                  >
                    <SelectTrigger className="h-11 shadow-sm">
                      <SelectValue placeholder={
                        loading.companies ? "Loading companies..." :
                          companies.length === 0 ? "No companies found" :
                            "Select company"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.name} value={company.name}>
                          {company.company_name || company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offer Terms Card */}
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Job Offer Terms
                  {offerTerms.length > 0 && (
                    <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                      {offerTerms.length} term{offerTerms.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  onClick={addOfferTerm}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                {offerTerms.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <FileText className="h-16 w-16" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-600">No offer terms added yet</p>
                        <p className="text-xs text-gray-500">Click "Add Term" to create terms or select a template above</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b sticky top-0">
                      <tr>
                        <th className="text-left p-4 w-16 text-xs font-semibold text-gray-700 uppercase tracking-wider">No.</th>
                        <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Offer Term <span className="text-red-500">*</span>
                        </th>
                        <th className="text-left p-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Value / Description <span className="text-red-500">*</span>
                        </th>
                        <th className="w-24"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {offerTerms.map((term, index) => (
                        <tr key={term.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="p-4 text-sm text-gray-500 font-medium">{index + 1}</td>
                          <td className="p-4">
                            <Input
                              value={term.offer_term}
                              onChange={(e) => updateOfferTerm(term.id, 'offer_term', e.target.value)}
                              placeholder="e.g., Base Salary, Health Insurance"
                              className="h-10 shadow-sm"
                            />
                          </td>
                          <td className="p-4">
                            <Textarea
                              value={term.value_description}
                              onChange={(e) => updateOfferTerm(term.id, 'value_description', e.target.value)}
                              placeholder="e.g., $80,000 per year, comprehensive coverage"
                              className="min-h-[60px] shadow-sm"
                              rows={2}
                            />
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOfferTerm(term.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="px-6 h-11 shadow-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 h-11 shadow-lg hover:shadow-xl transition-all"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Offer...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Create Offer
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}