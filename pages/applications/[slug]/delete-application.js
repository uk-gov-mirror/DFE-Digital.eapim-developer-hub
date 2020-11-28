import React from 'react'
import ErrorPage from 'components/ErrorPage'
import ApplicationPage from 'components/pages/ApplicationPage'
import { getContent } from '../../../content/applicationManagement'

import { getApplication } from '../../../lib/applicationService'
import getInitialPropsErrorHandler from '../../../lib/getInitialPropsErrorHandler'

const content = getContent('delete-application')

const DeleteApplication = ({ application, router, errorCode }) => {
  if (errorCode) return <ErrorPage statusCode={errorCode} router={router} />

  return (
    <ApplicationPage title={content.title} router={router} layout='two-thirds' back='to application details page'>
      <h1 className='govuk-heading-xl'>{content.title}</h1>

      <dl className='govuk-summary-list'>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>Application:</dt>
          <dd className='govuk-summary-list__value'>{application.applicationName}</dd>
        </div>
      </dl>

      <a href={`/applications/${application.applicationId}/delete-confirm`} className='govuk-button govuk-!-margin-top-6 govuk-!-margin-right-1' role='button'>{content.buttons.continue}</a>
      <a href={`/applications/${application.applicationId}/details`} className='govuk-button govuk-button--secondary govuk-!-margin-top-6' role='button'>{content.buttons.cancel}</a>
    </ApplicationPage>
  )
}

DeleteApplication.getInitialProps = async ({ res, query }) => {
  try {
    const application = await getApplication(query.slug)
    if (!application) return getInitialPropsErrorHandler(res, 404)

    return {
      id: query.slug,
      application
    }
  } catch (error) {
    return getInitialPropsErrorHandler(res, 500, error)
  }
}

DeleteApplication.displayName = 'Application Delete'

export default DeleteApplication
