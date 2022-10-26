import { ArrowUpDownIcon } from '@chakra-ui/icons'
import { ButtonGroup, Container, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Flex, Heading, IconButton, Link, List, ListItem, Stack, useDisclosure } from '@chakra-ui/react'
import { FC, PropsWithChildren, useRef } from 'react'
import { useT } from 'talkr'
import { useGoto } from '../hooks'

const NavigationStack: FC<PropsWithChildren<{ heading: string }>> = ({ children, heading }) => {
  return (
    <Stack w='280px' maxW='calc(100vh - 72px)' display='inline-block' marginBottom={4}>
      <Heading as='h3' size='md'>{heading}</Heading>
      {children}
    </Stack>
  )
}

export const Navbar: FC = () => {
  const { goto } = useGoto()
  const buttonRef = useRef(null)
  const { T } = useT()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Container maxW='container.lg'>
        <Flex
          direction='row'
          paddingY={4}
          paddingX={8}
          gap={8}
          wrap='wrap'
          justifyContent='center'
          alignItems='center'
        >
          <Heading as='h1' size='md' onClick={goto('/')} cursor='pointer'>
            Bluenest
          </Heading>
          <ButtonGroup marginLeft='auto'>
            <IconButton
              aria-label='open full sitemap'
              variant='ghost'
              icon={<ArrowUpDownIcon />}
              onClick={onOpen}
              ref={buttonRef}
            />
          </ButtonGroup>
        </Flex>
      </Container>
      <Drawer
        isOpen={isOpen}
        placement='top'
        onClose={onClose}
        finalFocusRef={buttonRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader paddingX={0}>
            <Container maxW='container.lg' paddingX={12}>
              <Flex
                direction='row'
                gap={8}
                wrap='wrap'
                justifyContent='center'
                alignItems='center'
              >
                <Heading as='h2' size='md'>
                  Bluenest Helpdesk
                </Heading>
                <IconButton
                  marginLeft='auto'
                  aria-label='close full sitemap'
                  variant='ghost'
                  icon={<ArrowUpDownIcon />}
                  onClick={onClose}
                  ref={buttonRef}
                />
              </Flex>
            </Container>
          </DrawerHeader>
          <DrawerBody paddingX={0}>
            <Container maxW='container.lg' paddingX={12} marginBottom={20}>
              <Flex
                direction='row'
                gap={8}
                wrap='wrap'
              >
                <NavigationStack heading='고객센터'>
                  <List>
                    <ListItem><Link href='mailto:seia@outlook.kr'>Email</Link></ListItem>
                  </List>
                </NavigationStack>
                <NavigationStack heading={T('nav.account.heading')}>
                  <List>
                    <ListItem><Link href='/connect/revoke'>{T('nav.account.menu.revokeSession')}</Link></ListItem>
                  </List>
                </NavigationStack>
              </Flex>
            </Container>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
