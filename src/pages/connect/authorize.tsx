import { CheckCircleIcon } from '@chakra-ui/icons'
import { Button, Center, Container, Heading, List, ListIcon, ListItem, Stack } from '@chakra-ui/react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { useT } from 'talkr'
import { goto } from '../../utils/pages'

const AuthorizeConnect: NextPage = () => {
  const { T } = useT()
  const router = useRouter()
  const [isLoading, setLoading] = useState<boolean>(false)

  return (
    <>
      <Container maxW='container.md' padding={8}>
        <Stack alignItems='center' paddingY={12}>
          <Heading as='h1' size='lg'>
            {T('connect.authorize.heading')}
          </Heading>
          <p>{T('connect.authorize.paragraph.a')}</p>
        </Stack>
        <List spacing={4} paddingY={10}>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color='purple.600' />
            {T('connect.authorize.paragraph.b')}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color='purple.600' />
            {T('connect.authorize.paragraph.c')}
          </ListItem>
          <ListItem>
            <ListIcon as={CheckCircleIcon} color='purple.600' />
            {T('connect.authorize.paragraph.d')}
          </ListItem>
        </List>
        <Center paddingY={4}>
          <Stack direction='column'>
            <Button onClick={goto(router, '/api/session/revoke')}>{T('connect.authorize.action.deny')}</Button>
            <Button
              isLoading={isLoading}
              colorScheme='purple'
              onClick={() => {
                setLoading(true)
                goto(router, '/api/connect/request')()
              }}
            >
              {T('connect.authorize.action.allow')}
            </Button>
          </Stack>
        </Center>
      </Container>
    </>
  )
}

export default AuthorizeConnect
