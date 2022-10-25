import { Avatar, Box, Flex, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'
import { TTwitterTimelineResponse } from '../models/api/specifications'

export const Tweet: FC<PropsWithChildren<{ tweet: TTwitterTimelineResponse['payload'][number] }>> = ({ tweet }) => {
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
        <Avatar src={tweet.user.profile_image_url_https} />
        <Flex direction='column' justifyContent='center'>
          <Heading as='h3' size='sm'>
            {tweet.user.name}
          </Heading>
          <Text>@{tweet.user.screen_name}</Text>
        </Flex>
      </Stack>
      <Text color='gray.700' marginTop={4}>{tweet.full_text.slice(...tweet.display_text_range)}</Text>
      {
        tweet?.entities?.media?.length > 0 && (
          <Image
            objectFit='cover'
            width='100%'
            maxHeight='100%'
            rounded='lg'
            src={tweet.entities.media[0].media_url_https}
          />
        )
      }
    </Box>
  )
}
