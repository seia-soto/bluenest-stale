import { Container, Heading, Stack, Text } from '@chakra-ui/react'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useT } from 'talkr'
import { Tweet } from '../../../../components/Card'
import { EaseOnUp } from '../../../../components/Transition'
import { useFetch } from '../../../../hooks'
import { TTwitterThreadResponse } from '../../../../models/api/specifications'

interface IProps {
  id: string
}

const ImportThread: NextPage<IProps> = ({ id }) => {
  if (!id) {
    location.href = '/dashboard'

    return
  }

  const params = new URLSearchParams()

  params.set('id', id)

  const { isLoading, isError, response } = useFetch<TTwitterThreadResponse>('/api/twitter/threads?' + params.toString())
  const [isActive, setActive] = useState<boolean>(false)
  const { T } = useT()

  useEffect(() => {
    if (!isLoading) {
      setActive(true)
    }
  }, [isLoading])

  if (isLoading) {
    return null
  }

  if (!response.payload.length) {
    return null
  }

  if (isError) {
    return (
      <Text textAlign='center'>{T('_.error')}</Text>
    )
  }

  return (
    <Container size='container.sm' centerContent={true}>
      <EaseOnUp isActive={isActive}>
        <Stack direction='column' spacing={2} marginY={10} textAlign='center'>
          <Heading as='h3' size='md'>
            타래를 Bluenest로 가져왔습니다
          </Heading>
          <Text>
            WIP
          </Text>
        </Stack>
        <Stack
          direction='column'
          spacing={6}
          transition={'opacity ease .4s'}
        >
          {
            response.payload.map(entry => (
              <div key={entry.id_str}>
                <Tweet tweet={entry} />
              </div>
            ))
          }
        </Stack>
      </EaseOnUp>
    </Container>
  )
}

ImportThread.getInitialProps = async (ctx) => {
  const { id: kId } = ctx.query
  const id = kId.toString()

  if (isNaN(parseInt(id))) {
    return {
      id: ''
    }
  }

  return {
    id
  }
}

export default ImportThread
