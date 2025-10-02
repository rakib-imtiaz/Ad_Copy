// Form Auto-Fill Service
// Handles mapping parsed data to form fields

import { BrandFormData } from '@/types'

export interface AutoFillResult {
  success: boolean
  filledFields: string[]
  message: string
}

export class FormAutoFillService {
  static autoFillForm(
    formData: BrandFormData, 
    parsedData: any, 
    updateNestedField: (path: string[], value: any) => void,
    updateField: (field: string, value: string) => void
  ): AutoFillResult {
    console.log('🔄 Auto-filling form with parsed data:', {
      type: typeof parsedData,
      isArray: Array.isArray(parsedData),
      hasCompanyName: !!(parsedData.companyName || parsedData.businessName || parsedData.name),
      hasTagline: !!(parsedData.tagline || parsedData.description),
      keys: Object.keys(parsedData || {})
    })
    
    const filledFields: string[] = []

    try {
      // Company/Business Name
      if (parsedData.companyName || parsedData.businessName || parsedData.name) {
        const companyName = parsedData.companyName || parsedData.businessName || parsedData.name
        updateNestedField(['brandIdentity', 'businessNameTagline', 'name'], companyName)
        filledFields.push('Company Name')
      }

      // Tagline/Description
      if (parsedData.tagline || parsedData.description || parsedData.summary) {
        const tagline = parsedData.tagline || parsedData.description || parsedData.summary
        updateNestedField(['brandIdentity', 'businessNameTagline', 'tagline'], tagline)
        filledFields.push('Tagline')
      }

      // Mission Statement
      if (parsedData.mission || parsedData.missionStatement) {
        const mission = parsedData.mission || parsedData.missionStatement
        updateNestedField(['brandIdentity', 'missionStatement', 'whyWeExist'], mission)
        filledFields.push('Mission Statement')
      }

      // Industry
      if (parsedData.industry) {
        updateField('industry', parsedData.industry)
        filledFields.push('Industry')
      }

      // Service/Product
      if (parsedData.service || parsedData.product || parsedData.services) {
        const service = parsedData.service || parsedData.product || parsedData.services
        updateField('service', service)
        filledFields.push('Service/Product')
      }

      // Founder Information
      if (parsedData.founders || parsedData.founder) {
        const founders = parsedData.founders || parsedData.founder
        updateNestedField(['brandIdentity', 'founderNameBackstory', 'founders'], founders)
        filledFields.push('Founders')
      }

      if (parsedData.backstory || parsedData.story) {
        const backstory = parsedData.backstory || parsedData.story
        updateNestedField(['brandIdentity', 'founderNameBackstory', 'backstory'], backstory)
        filledFields.push('Founder Backstory')
      }

      // Principles/Values
      if (parsedData.principles || parsedData.values) {
        const principles = parsedData.principles || parsedData.values
        updateNestedField(['brandIdentity', 'missionStatement', 'principles'], principles)
        filledFields.push('Principles')
      }

      // Business Model
      if (parsedData.businessModel) {
        updateNestedField(['brandIdentity', 'businessModelType'], parsedData.businessModel)
        filledFields.push('Business Model')
      }

      // USP
      if (parsedData.usp || parsedData.uniqueSellingProposition) {
        const usp = parsedData.usp || parsedData.uniqueSellingProposition
        updateNestedField(['brandIdentity', 'uniqueSellingProposition'], usp)
        filledFields.push('Unique Selling Proposition')
      }

      // Social Media Links
      if (parsedData.socialMedia) {
        if (parsedData.socialMedia.instagram) {
          updateNestedField(['clientAssets', 'socialMediaProfiles', 'instagram'], parsedData.socialMedia.instagram)
        }
        if (parsedData.socialMedia.facebook) {
          updateNestedField(['clientAssets', 'socialMediaProfiles', 'facebook'], parsedData.socialMedia.facebook)
        }
        if (parsedData.socialMedia.youtube) {
          updateNestedField(['clientAssets', 'socialMediaProfiles', 'youtube'], parsedData.socialMedia.youtube)
        }
        if (parsedData.socialMedia.tiktok) {
          updateNestedField(['clientAssets', 'socialMediaProfiles', 'tiktok'], parsedData.socialMedia.tiktok)
        }
        filledFields.push('Social Media')
      }

      // Testimonials
      if (parsedData.testimonials && Array.isArray(parsedData.testimonials)) {
        updateNestedField(['clientAssets', 'testimonialsCaseStudies'], parsedData.testimonials)
        filledFields.push('Testimonials')
      }

      // Target Audience
      if (parsedData.targetAudience || parsedData.audience) {
        const audience = parsedData.targetAudience || parsedData.audience
        if (typeof audience === 'string') {
          updateNestedField(['targetAudience', 'idealCustomerProfile', 'description'], [audience])
        } else if (Array.isArray(audience)) {
          updateNestedField(['targetAudience', 'idealCustomerProfile', 'description'], audience)
        }
        filledFields.push('Target Audience')
      }

      // Pain Points
      if (parsedData.painPoints && Array.isArray(parsedData.painPoints)) {
        updateNestedField(['targetAudience', 'primaryPainPoints'], parsedData.painPoints)
        filledFields.push('Pain Points')
      }

      // Goals
      if (parsedData.goals && Array.isArray(parsedData.goals)) {
        updateNestedField(['targetAudience', 'primaryDesiresGoals'], parsedData.goals)
        filledFields.push('Goals')
      }

      // Products/Offers
      if (parsedData.products && Array.isArray(parsedData.products)) {
        const transformedOffers = parsedData.products.map((product: any) => ({
          name: product.name || product.title || '',
          price: product.price || product.cost || '',
          description: product.description || product.summary || ''
        }))
        updateNestedField(['offers'], transformedOffers)
        filledFields.push('Products/Offers')
      }

      // Other Information
      if (parsedData.otherInfo || parsedData.about || parsedData.overview || parsedData.content) {
        const otherInfo = parsedData.otherInfo || parsedData.about || parsedData.overview || parsedData.content
        updateField('otherInformation', otherInfo)
        filledFields.push('Other Information')
      }

      const message = filledFields.length > 0 
        ? `Successfully auto-filled: ${filledFields.join(', ')}`
        : 'URL scraped successfully, but no recognizable data found to auto-fill'

      return {
        success: true,
        filledFields,
        message
      }

    } catch (error) {
      console.error('❌ Error auto-filling form:', error)
      return {
        success: false,
        filledFields: [],
        message: 'Error occurred while auto-filling form'
      }
    }
  }
}
