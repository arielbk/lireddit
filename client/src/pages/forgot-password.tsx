import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [isComplete, setIsComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="sm">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setIsComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          isComplete ? (
            <Box>We&apos;ve sent an email to that address to reset your password </Box>
          ) : (
            <Form>
              <InputField name="email" placeholder="email" label="Email" type="email" />
              <Button isLoading={isSubmitting} type="submit" colorScheme="blue" mt={8}>
                Submit
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
