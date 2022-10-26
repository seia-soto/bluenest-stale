import { Button, Container, Heading, Input, InputGroup, InputRightElement, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Stack, Text, useDisclosure } from '@chakra-ui/react'
import { NextPage } from 'next'
import { FC, FormEventHandler, useEffect, useRef, useState } from 'react'
import { useT } from 'talkr'
import { Tweet } from '../../components/Card'
import { EaseOnUp } from '../../components/Transition'
import { useFetch, useGoto } from '../../hooks'
import { TTwitterTimelineResponse } from '../../models/api/specifications'

const RecentTweets: FC = () => {
  const { goto } = useGoto()
  const { isLoading, isError, response } = useFetch<TTwitterTimelineResponse>(
    '/api/twitter/recents',
    {
      method: 'POST'
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

  if (!response.payload.length) {
    return null
  }

  if (isError) {
    return (
      <Text textAlign='center'>{T('_.error')}</Text>
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
          response.payload.map(entry => (
            <div key={entry.id_str} onClick={goto('/dashboard/import/thread/' + entry.id_str)}>
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
  const { goto } = useGoto()

  const submitLinkAfterValidate: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()

    const value: string = linkRef.current.value
    const pattern = /https:\/\/twitter\.com\/\w+\/status\/(\d+)/
    const kIsValid = pattern.test(value)

    setValid(kIsValid)

    if (!(isOpen || kIsValid)) {
      onToggle()
    }

    const [, id] = pattern.exec(value)

    goto('/dashboard/import/thread/' + id)()
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
