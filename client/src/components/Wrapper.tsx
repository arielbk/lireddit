import { Box } from '@chakra-ui/react';

interface WrapperProps {
  variant?: 'sm' | 'md'
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant }) => {
  return (
    <Box mt={8} mx="auto" maxW={variant === 'md' ? "800px" : '400px'} w="100%">
      {children}
    </Box>
  )
}