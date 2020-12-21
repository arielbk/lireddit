import { Button, Flex, Link } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const router = useRouter();
  const [{}, login] = useLoginMutation();
  return (
    <Wrapper variant="sm">
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push('/');
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="usernameOrEmail" placeholder="Username or email" label="Username or email" />
            <InputField name="password" placeholder="Password" label="Password" type="password" />
            <Flex mt={4}>
              <NextLink href="/forgot-password">
                <Link ml="auto">Forget your password?</Link>
              </NextLink>
            </Flex>
            <Button isLoading={isSubmitting} type="submit" colorScheme="blue" mt={8}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
