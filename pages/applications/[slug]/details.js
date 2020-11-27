import timezone from 'moment-timezone'
import React from 'react'
import { connect } from 'react-redux'
import Link from 'next/link'
import Content from '../../../content.json'
import { clearApplication } from 'actions/application'
import ErrorPage from 'components/ErrorPage'
import Page from 'components/Page'
import { useAuth } from 'context'

import { getApplication } from '../../../lib/applicationService'
import getInitialPropsErrorHandler from '../../../lib/getInitialPropsErrorHandler'

const page = 'Application details'

const ApplicationDetails = ({ application, router, errorCode }) => {
  if (errorCode) return <ErrorPage statusCode={errorCode} router={router} />

  const { user } = useAuth()

  return (
    <Page title={page} router={router} sidebarContent={Content.ApplicationManagement} sidebarData={{ type: 'application', application }} requiresAuth>
      <h1 className='govuk-heading-xl'>{page}</h1>

      <dl className='govuk-summary-list'>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>
            Application:
          </dt>
          <dd className='govuk-summary-list__value'>
            {application.applicationName}
          </dd>
        </div>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>
            Created on:
          </dt>
          <dd className='govuk-summary-list__value'>
            {timezone.tz(application.createdOn, 'MM/DD/YYYY HH:mma', 'Europe/London').add(1, 'hour').format('DD MMMM YYYY, HH:mma')}
          </dd>
        </div>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>
            Client id:
          </dt>
          <dd className='govuk-summary-list__value'>
            {application.clientId}
          </dd>
        </div>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>
            Description:
          </dt>
          <dd className='govuk-summary-list__value'>
            {application.description}
          </dd>
        </div>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>
            Application Owner:
          </dt>
          <dd className='govuk-summary-list__value'>
            {user.name()}
          </dd>
        </div>
        <div className='govuk-summary-list__row'>
          <dt className='govuk-summary-list__key'>
            Contact email:
          </dt>
          <dd className='govuk-summary-list__value'>
            {user.email()}
          </dd>
        </div>
      </dl>

      <Link href='/applications/[slug]/api-subscriptions' as={`/applications/${application.applicationId}/api-subscriptions`}>
        <a className={'govuk-button govuk-button--default govuk-!-margin-top-6'}>Subscribe to APIs</a>
      </Link>
    </Page>
  )
}

ApplicationDetails.getInitialProps = async ({ res, query }) => {
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

ApplicationDetails.displayName = 'Application details (subscribe to APIs)'

export default connect(null, { clearApplication })(ApplicationDetails)
