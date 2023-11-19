import { Box } from '@chakra-ui/react'
import React from 'react'

export default function AppLayout({ children }: React.PropsWithChildren<void>) {
  return <Box>{children}</Box>
}
