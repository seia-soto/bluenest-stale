import { Avatar, Box, Flex, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'
import { ITwitterTweet } from '../models/types/twitter'

export const Tweet: FC<PropsWithChildren<{ tweet: ITwitterTweet }>> = ({ tweet }) => {
  return (
    <Box
      w='sm'
      rounded='lg'
      padding={4}
      bgColor='purple.50'
      _hover={{
        bgColor: 'purple.100'
      }}
      transition='background-color ease .4s'
      cursor='pointer'
    >
      <Stack direction='row'>
        <Avatar src={tweet.user.avatar.url} />
        <Flex direction='column' justifyContent='center'>
          <Heading as='h3' size='sm'>
            {tweet.user.name}
          </Heading>
          <Text>@{tweet.user.username}</Text>
        </Flex>
      </Stack>
      <Text color='gray.700' marginY={4}>{tweet.text}</Text>
      {
        tweet.attachments.length > 0 && (
          <Image
            objectFit='cover'
            width='100%'
            maxHeight='100%'
            rounded='lg'
            src={tweet.attachments[0].url}
          />
        )
      }
    </Box>
  )
}
