import { Button, Center, Container, Heading, Stack } from '@chakra-ui/react'
import { deleteCookie } from 'cookies-next'
import { NextPage, NextPageContext } from 'next'
import { useEffect } from 'react'
import { useT } from 'talkr'
import { useGoto } from '../../hooks'
import { ECookieNames } from '../../models/api/cookies'
import { persistStorage } from '../../models/client/kv'

const RevokeConnect: NextPage = () => {
  const { goto } = useGoto()
  const { T } = useT()

  useEffect(() => {
    persistStorage.source.clear()
  }, [])

  return (
    <>
      <Container maxW='container.md' padding={8}>
        <Stack alignItems='center' paddingY={12}>
          <Heading as='h1' size='lg'>
            {T('connect.revoke.heading')}
          </Heading>
          <p>{T('connect.revoke.paragraph')}</p>
        </Stack>
        <Center paddingY={4}>
          <Stack direction='column'>
            <Button onClick={goto('/')}>{T('connect.revoke.action.back')}</Button>
            <Button onClick={() => { location.href = 'https://twitter.com/settings/connected_apps' }}>{T('connect.revoke.action.complete')}</Button>
          </Stack>
        </Center>
      </Container>
    </>
  )
}

export const getServerSideProps = async (ctx: NextPageContext) => {
  const { req, res } = ctx

  deleteCookie(ECookieNames.general, { req, res })
  deleteCookie(ECookieNames.preAuthorization, { req, res })

  return {
    props: {}
  }
}

export default RevokeConnect
