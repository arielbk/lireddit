import { Box } from '@chakra-ui/react';

export type WrapperVariant = 'sm' | 'md';

interface WrapperProps {
  variant?: WrapperVariant;
}

export const Wrapper: React.FC<WrapperProps> = ({ children, variant }) => {
  return (
    <Box mt={8} mx="auto" maxW={variant === 'md' ? '800px' : '400px'} w="100%">
      {children}
    </Box>
  );
};
