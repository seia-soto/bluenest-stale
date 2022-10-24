import { Container } from '@chakra-ui/react'
import { NextPage } from 'next'
import { TTwitterRecentTweets } from '../../../models/types/twitter'
import { useFetch } from '../../../utils/pages'

const Dashboard: NextPage<{ tweet: string }> = ({ tweet }) => {
  const { isLoading, isError, status, data } = useFetch<TTwitterRecentTweets>(
    `/api/twitter/thread/${tweet}`,
    {
      method: 'POST'
    },
    {
      cacheTtl: 2 * 60 * 1000
    }
  )

  if (isLoading) {
    return <p>loading</p>
  }

  if (isError) {
    return <p>error</p>
  }

  return (
    <Container maxW='container.sm' centerContent={true}>
      <code>{status}</code>
      <code>{JSON.stringify(data)}</code>
    </Container>
  )
}

Dashboard.getInitialProps = async (ctx) => {
  const url = new URL(`http://a${ctx.req.url.toString()}`)

  return {
    tweet: url.searchParams.get('tweet')
  }
}

export default Dashboard
