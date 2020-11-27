import React, { useState, useEffect, Fragment } from 'react'
import { connect } from 'react-redux'
import Router from 'next/router'
import Content from '../../content.json'
import { Loading } from 'components/Loading'
import AuthWarning from 'components/AuthWarning'
import Page from 'components/Page'

import { selectApplication } from '../../src/actions/application'
import { getApplications } from '../../lib/applicationService'

const page = 'Applications'

const Applications = ({ user, selectApplication, router, msalConfig, msalRegisterConfig }) => {
  const [fetching, setFetching] = useState(false)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    const fetchApplications = async () => {
      setFetching(true)
      const apps = await getApplications(user.data.User)
      setApplications(apps)
      setFetching(false)
    }

    if (user.data && user.data.User) fetchApplications()
  }, [user])

  const selectApp = (e, app) => {
    e.preventDefault()
    selectApplication(app)
    Router.push('/applications/[slug]/details', `/applications/${app.applicationId}/details`)
  }

  let isLoggedIn = false
  if (user.data && user.data.isAuthed) isLoggedIn = true

  return (
    <Page title={page} router={router} sidebarContent={Content.Applications}>
      <h1 className='govuk-heading-xl'>{Content.Applications[page].Page}</h1>

      {!isLoggedIn && <AuthWarning msalConfig={msalConfig} msalRegisterConfig={msalRegisterConfig} warning={Content.Applications[page].Content.Auth.Warning} />}
      {fetching && <Loading />}

      {applications.length === 0 && !fetching && isLoggedIn && (
        <Fragment>
          <p className='govuk-body'>{Content.Applications[page].Content.NoApplications.Copy}</p>
          {isLoggedIn && (
            <button type='button' className='govuk-button govuk-!-margin-top-6' onClick={() => Router.push('/applications/create/step1')}>{Content.Applications[page].Content.NoApplications.Button}</button>
          )}
        </Fragment>
      )}
      {applications.length > 0 && !fetching && isLoggedIn && (
        <Fragment>
          <table className='govuk-table'>
            <thead className='govuk-table__head'>
              <tr className='govuk-table__row'>
                {Content.Applications[page].Content.tableHeadings.map((th, i) => {
                  return <th key={i} scope='col' className='govuk-table__header'>{th.Heading}</th>
                })}
              </tr>
            </thead>
            <tbody className='govuk-table__body'>
              {applications.length && applications.map((app, i) => {
                return (
                  <tr className='govuk-table__row' key={i}>
                    <th scope='row' className={`govuk-table__header`}>
                      <a href='#' onClick={(e) => selectApp(e, app)}>{app.applicationName}</a>
                    </th>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {applications.length < 5 && (
            <button type='button' className='govuk-button govuk-!-margin-top-6' onClick={() => Router.push('/applications/create/step1')}>Add new application</button>
          )}
        </Fragment>
      )}
    </Page>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

Applications.displayName = 'Applications listing'

export default connect(mapStateToProps, { selectApplication })(Applications)
