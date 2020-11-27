import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import * as Msal from 'msal'
import Router from 'next/router'
import { Loading } from 'components/Loading'
import { b2cPolicies, config } from '../lib/authService'
import { AuthContext } from '../src/context'

class SignInSuccess extends Component {
  static contextType = AuthContext

  constructor (props) {
    super(props)
    this.state = {
      name: '',
      user: undefined,
      passwordChanged: false
    }
  }

  componentDidUpdate = () => {
    const myMSALObj = new Msal.UserAgentApplication(config.login)

    myMSALObj.handleRedirectCallback((error, response) => {
      console.log('MSAL Error Message: ', error && error.errorMessage)
      console.log('MSAL Response: ', response)

      // Error handling
      if (error) {
        if (error.errorMessage.indexOf('Invalid state') > -1) {
          return Router.push('/')
        }
        // user has no account
        if (error.errorMessage.indexOf('AADB2C99002') > -1) {
          return Router.push('/')
        }

        // user cancelled creating an account
        // user cancelled forgot password
        // user cancelled updating profile
        if (error.errorMessage.indexOf('AADB2C90091') > -1) {
          // const { returnTo: { returnUrl } } = this.props
          // return Router.push(returnUrl || '/')
          // this.setState({ redirectPage: 'back to the homepage' })
          return Router.push('/')
        }

        // user went from signin to create account
        if (error.errorMessage.indexOf('AADB2C90037') > -1) {
          return Router.replace('/auth/register')
        }

        // Check for forgot password error
        // Learn more about AAD error codes at https://docs.microsoft.com/en-us/azure/active-directory/develop/reference-aadsts-error-codes
        if (error.errorMessage.indexOf('AADB2C90118') > -1) {
          return Router.replace('/auth/forgot-password')
          // myMSALObj.loginRedirect('/forgot-password')
        }
      } else {
        // We need to reject id tokens that were not issued with the default sign-in policy.
        // 'acr' claim in the token tells us what policy is used (NOTE: for new policies (v2.0), use 'tfp' instead of 'acr')
        // To learn more about b2c tokens, visit https://docs.microsoft.com/en-us/azure/active-directory-b2c/tokens-overview

        if (response.tokenType === 'id_token' && response.idToken.claims['acr'] === b2cPolicies.names.forgotPassword) {
          this.setState({ passwordChanged: true })
        } else if (response.tokenType === 'id_token' && (response.idToken.claims['acr'] === b2cPolicies.names.signIn || response.idToken.claims['acr'] === b2cPolicies.names.signUp || response.idToken.claims['acr'] === b2cPolicies.names.verify)) {
          console.log('id_token acquired at: ' + new Date().toString())
          console.log('authority', config.login.auth.authority)
          if (!myMSALObj.getAccount()) {
            myMSALObj.loginRedirect()
          } else {
            const account = myMSALObj.getAccount()
            const userName = myMSALObj.getAccount().name
            if (this.state.name === '') {
              this.setState({
                name: userName,
                user: account
              })
            }
            console.log('signin-success', account)
            this.context.setToken(account)
          }
        } else {
          console.log('Token type is: ' + response.tokenType)
        }
      }
    })
  }

  render () {
    const { returnTo: { returnUrl } } = this.props

    console.log('returnTo', this.props.returnTo)

    if (this.context.user.getToken()) Router.push(returnUrl || '/')

    return (
      <Fragment>
        {!this.state.passwordChanged && (<Loading />)}
        {this.state.passwordChanged && (
          <div className='govuk-width-container'>
            <main className='govuk-main-wrapper' id='main-content' role='main'>
              <div className='govuk-grid-row'>
                <div className='govuk-grid-column-full'>
                  <div className='notification notification-success' role='alert' aria-label='Password has been reset successfully. Please sign-in with your new password.' aria-live='polite'>
                    <h2 className='govuk-!-margin-bottom-4'>Password has been reset successfully.</h2>
                    <p className='govuk-body govuk-!-margin-bottom-0'>Please sign-in with your new password.</p>
                  </div>

                  <p className='govuk-body'><a href='/auth/login' className='govuk-link'><strong>Sign in</strong></a> to the Developer Hub.</p>
                </div>
              </div>
            </main>
          </div>
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    returnTo: state.returnTo
  }
}

SignInSuccess.displayName = 'B2C page callback'

export default connect(mapStateToProps)(SignInSuccess)
