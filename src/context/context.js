import React, { useState, useEffect, createContext } from 'react'
import mockUser from './mockData.js/mockUser'
import mockRepos from './mockData.js/mockRepos'
import mockFollowers from './mockData.js/mockFollowers'
import axios from 'axios'

const rootUrl = 'https://api.github.com'

const GithubContext = createContext()

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser)
  const [repos, setRepos] = useState(mockRepos)
  const [followers, setFollowers] = useState(mockFollowers)
  // requests loading
  const [requests, setRequests] = useState(0)
  const [limit, setLimit] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({ show: false, message: '' })
  //check requests
  const checkRequests = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        console.log(data)
        let {
          rate: { remaining, limit },
        } = data
        setRequests(remaining)
        setLimit(limit)
        if (remaining === 0) {
          // throw error
          toggleError(true, 'Sorry, You have exceeded your hourly limit!')
        }
      })
      .catch((error) => console.log(error))
  }

  const toggleError = (show = false, message = '') => {
    setError({ show, message })
  }

  // search user
  const searchGithubUser = async (user) => {
    toggleError()
    setIsLoading(true)

    const response = await axios(`${rootUrl}/users/${user}`).catch((error) =>
      console.log(error)
    )

    if (response) {
      setGithubUser(response.data)
      const { login, followers_url } = response.data

      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ]).then((results) => {
        const [repos, followers] = results
        const status = 'fulfilled'

        if (repos.status === status) {
          setRepos(repos.value.data)
        }
        if (followers.status === status) {
          setFollowers(followers.value.data)
        }
      })
    } else {
      toggleError(true, `No user found with the username ${user}`)
    }

    checkRequests()
    setIsLoading(false)
  }

  useEffect(checkRequests, [])

  return (
    <GithubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        limit,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}

export { GithubProvider, GithubContext }
