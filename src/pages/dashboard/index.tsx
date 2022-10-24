import { Button, Container, Heading, Input, InputGroup, InputRightElement, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FC, FormEventHandler, useEffect, useRef, useState } from 'react'
import { useT } from 'talkr'
import { Tweet } from '../../components/Card'
import { EaseOnUp } from '../../components/Transition'
import { EResponseStatus } from '../../models/types/api'
import { TTwitterRecentTweets } from '../../models/types/twitter'
import { goto, useFetch } from '../../utils/pages'

const RecentTweets: FC = () => {
  const router = useRouter()
  const { isLoading, isError, status, data } = useFetch<TTwitterRecentTweets>(
    '/api/twitter/recents',
    {
      method: 'POST'
    },
    {
      cacheTtl: 15 * 1000
    }
  )
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

  if (isError) {
    return (
      <Text textAlign='center'>{T('_.error')}</Text>
    )
  }

  if (status === EResponseStatus.AuthorizationRequired) {
    return (
      <Stack direction='column'>
        <Text textAlign='center'>
          {T('dashboard.recents.reauthorizationRequired.statusText.a')}<br />
          {T('dashboard.recents.reauthorizationRequired.statusText.b')}
        </Text>
        <Button colorScheme='purple' onClick={goto(router, '/api/connect/request')}>
          {T('dashboard.recents.reauthorizationRequired.action.continue')}
        </Button>
      </Stack>
    )
  }

  return (
    <EaseOnUp isActive={isActive}>
      <Stack direction='column' spacing={2} marginY={10} textAlign='center'>
        <Heading as='h3' size='md'>
          {T('dashboard.recents.heading')}
        </Heading>
        <Text>
          {T('dashboard.recents.paragraph')}
        </Text>
      </Stack>
      <Stack
        direction='column'
        spacing={6}
        transition={'opacity ease .4s'}
      >
        {
          data.map(entry => (
            <div
              key={entry.id}
              onClick={goto(router, `/dashboard/thread/import?tweet=${entry.id}`)}
            >
              <Tweet tweet={entry} />
            </div>
          ))
        }
      </Stack>
    </EaseOnUp>
  )
}

const ManualTweet: FC = () => {
  const [isValid, setValid] = useState<boolean>(true)
  const linkRef = useRef<HTMLInputElement>(null)
  const { T } = useT()
  const { isOpen, onToggle, onClose } = useDisclosure()

  const submitLinkAfterValidate: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const value: string = linkRef.current.value
    const kIsValid = /https:\/\/twitter\.com\/\w+\/status\/\d+/.test(value)

    setValid(kIsValid)

    if (!(isOpen || kIsValid)) {
      onToggle()
    }
  }

  useEffect(() => {
    if (!linkRef.current || isOpen) {
      return
    }

    linkRef.current.focus()
  }, [isOpen])

  return (
    <Container marginY={16}>
      <Stack direction='column' spacing={4}>
        <Heading as='h2' size='lg' textAlign='center'>
          {T('dashboard.manual.heading')}
        </Heading>
        <Text textAlign='center'>
          {T('dashboard.manual.paragraph')}
        </Text>
      </Stack>
      <form onSubmit={submitLinkAfterValidate}>
        <Popover
          returnFocusOnClose={false}
          isOpen={isOpen}
          onClose={onClose}
          placement='bottom'
          closeOnBlur={false}
          isLazy={true}
          lazyBehavior='keepMounted'
        >
          <PopoverTrigger>
            <InputGroup size='md' marginY={8}>
              <Input
                ref={linkRef}
                pr='4.5rem'
                type='text'
                colorScheme='purple'
                placeholder={T('dashboard.manual.placeholder')}
                isInvalid={!isValid}
                errorBorderColor='crimson'
                _focus={{
                  borderColor: isValid ? '' : 'crimson'
                }}
              />
              <InputRightElement width='8rem'>
                <Button h='1.75rem' size='sm' type='submit' colorScheme='purple'>
                  {T('dashboard.manual.action.import')}
                </Button>
              </InputRightElement>
            </InputGroup>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader fontWeight='semibold'>{T('dashboard.manual.error.heading')}</PopoverHeader>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              {T('dashboard.manual.error.paragraph')}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </form>
    </Container>
  )
}

const Dashboard: NextPage = () => {
  return (
    <Container maxW='container.sm' centerContent={true}>
      <ManualTweet />
      <RecentTweets />
    </Container>
  )
}

export default Dashboard
