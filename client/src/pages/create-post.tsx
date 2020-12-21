import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation, useMeQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC<{}> = ({}) => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  useIsAuth();

  return (
    <Layout variant="sm">
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values, { setErrors }) => {
          const { error } = await createPost({ input: values });
          if (!error) router.push('/');
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <InputField textarea name="text" placeholder="text..." label="Body" />
            <Button isLoading={isSubmitting} type="submit" colorScheme="blue" mt={8}>
              Publish
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
