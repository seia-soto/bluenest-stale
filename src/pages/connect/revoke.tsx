import { Button, Center, Container, Heading, Stack } from '@chakra-ui/react'
import { NextPage } from 'next'
import { useT } from 'talkr'
import { useGoto } from '../../hooks'

const RevokeConnect: NextPage = () => {
  const { goto } = useGoto()
  const { T } = useT()

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

export default RevokeConnect
