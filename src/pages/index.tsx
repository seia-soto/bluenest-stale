import { Box, Button, Container, Heading, Stack } from '@chakra-ui/react'
import { ArrowForwardIcon } from '@chakra-ui/icons'
import { NextPage } from 'next'
import { useT } from 'talkr'
import { useGoto } from '../hooks'

const Main: NextPage = () => {
  const { goto } = useGoto()
  const { T } = useT()

  return (
    <>
      <Box>
        <Container
          maxW='container.xl'
          style={{
            paddingTop: '120px',
            paddingBottom: '280px',
            maxWidth: '100vh'
          }}
          textAlign='center'
          padding={10}
        >
          <Stack spacing={6}>
            <Heading as='h1' size='2xl' lineHeight='1.2em'>
              {T('about.heading.a')}<br />
              {T('about.heading.b')}
            </Heading>
          </Stack>
          <Button
            size='lg'
            colorScheme='purple'
            rightIcon={<ArrowForwardIcon />}
            margin='24px 0'
            onClick={goto('/connect/authorize')}
          >
            {T('about.action')}
          </Button>
        </Container>
      </Box>
      <Container maxW='container.xl' padding={8}>
        <Stack spacing={4}>
          <Heading as='h3' size='lg' lineHeight='1.8em'>
            {T('about.a.paragraph.a')}<br />
            {T('about.a.paragraph.b')}<br />
            {T('about.a.paragraph.c')}<br />
            {T('about.a.paragraph.d')}
          </Heading>
        </Stack>
      </Container>
    </>
  )
}

export default Main
