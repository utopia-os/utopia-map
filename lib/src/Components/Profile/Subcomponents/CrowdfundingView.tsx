import axios from 'axios'
import { useState, useEffect } from 'react'

import { useAppState } from '#components/AppShell/hooks/useAppState'

import type { Item } from '#types/Item'

interface AccountData {
  account: {
    name: string
    type: string
    stats: {
      balance: {
        valueInCents: number
        currency: string
      } | null
      totalAmountReceived: {
        valueInCents: number
        currency: string
      }
      totalAmountSpent: {
        valueInCents: number
        currency: string
      }
      contributionsCount: number
      contributorsCount: number
    }
  }
}

interface GraphQLResponse<T> {
  data?: T
  errors?: { message: string }[]
}

const GET_TRANSACTIONS = `
  query GetAccountStats($slug: String!) {
    account(slug: $slug) {
      name
      type
      stats {
        balance {
          valueInCents
          currency
        }
        totalAmountReceived(net: true) {
          valueInCents
          currency
        }
        totalAmountSpent {
          valueInCents
          currency
        }
        contributionsCount
        contributorsCount
      }
    }
  }
`

const formatCurrency = (valueInCents: number, currency: string) => {
  const value = valueInCents / 100
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    ...(Math.abs(value) >= 1000 ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  }
  return new Intl.NumberFormat('de-DE', options).format(value)
}

export const CrowdfundingView = ({ item }: { item: Item }) => {
  // Hier wird slug aus dem Item extrahiert.
  const slug = item.openCollectiveSlug
  const appState = useAppState()

  const token = appState.openCollectiveApiKey

  const graphqlClient = axios.create({
    baseURL: 'https://api.opencollective.com/graphql/v2',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const [data, setData] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await graphqlClient.post<GraphQLResponse<AccountData>>('', {
          query: GET_TRANSACTIONS,
          variables: { slug },
        })
        if (response.data.errors?.length) {
          setError(response.data.errors[0].message)
        } else {
          setData(response.data.data ?? null)
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          throw err
        }
      }
      setLoading(false)
    }

    if (slug) {
      void fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  if (!slug) return null

  if (loading)
    return (
      <div className='tw:flex tw:justify-center'>
        <span className='tw:loading tw:loading-spinner tw:loading-lg tw:text-neutral-content'></span>
      </div>
    )

  if (error) {
    return <p className='tw:text-center tw:text-lg tw:text-red-500'>Error: {error}</p>
  }

  if (!data?.account) {
    return (
      <p className='tw:text-center tw:text-lg tw:text-red-500'>
        No data available for this account.
      </p>
    )
  }

  const { stats } = data.account
  const balanceValueInCents = stats.balance?.valueInCents ?? 0
  const currency = stats.balance?.currency ?? 'USD'
  const currentBalance = balanceValueInCents

  return (
    <div>
      <div className='tw:card tw:bg-base-200 tw:w-fit tw:max-w-full tw:shadow'>
        <div className='tw:stats tw:bg-base-200 tw:stats-horizontal tw:rounded-b-none'>
          <div className='tw:stat tw:p-3'>
            <div className='tw:stat-title'>Current Balance</div>
            <div className='tw:stat-value tw:text-xl lg:tw:text-3xl'>
              {formatCurrency(currentBalance, currency)}
            </div>
          </div>
          <div className='tw:stat tw:p-3'>
            <div className='tw:stat-title'>Received</div>
            <div className='tw:stat-value tw:text-green-500 tw:text-xl lg:tw:text-3xl'>
              {formatCurrency(stats.totalAmountReceived.valueInCents, currency)}
            </div>
          </div>
          <div className='tw:stat tw:p-3'>
            <div className='tw:stat-title'>Spent</div>
            <div className='tw:stat-value tw:text-red-500 tw:text-xl lg:tw:text-3xl'>
              {formatCurrency(stats.totalAmountReceived.valueInCents - currentBalance, currency)}
            </div>
          </div>
        </div>
        <hr className='tw:border-1 tw:border-current/10 tw:border-dashed'></hr>
        <div className='tw:m-4 tw:items-center'>
          <a href={`https://opencollective.com/${slug}/donate`} target='_blank' rel='noreferrer'>
            <button className='tw:btn tw:btn-sm tw:btn-primary tw:float-right tw:ml-4'>
              Donate
            </button>
          </a>
          <div className='tw:flex-1 tw:mr-4'>
            Support{' '}
            <a
              className='tw:font-bold'
              href={`https://opencollective.com/${slug}`}
              target='_blank'
              rel='noreferrer'
            >
              {data.account.name}
            </a>{' '}
            on <span className='tw:font-bold'>Open&nbsp;Collective</span>
          </div>
        </div>
      </div>
    </div>
  )
}
