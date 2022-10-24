import { Box } from '@chakra-ui/react'
import { FC, PropsWithChildren } from 'react'

export const EaseOnUp: FC<PropsWithChildren<{ isActive: boolean }>> = ({ children, isActive }) => {
  return <Box opacity={Number(isActive)} transition='opacity ease .8s'>
    {children}
  </Box>
}
