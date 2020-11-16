import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  return (
    <Wrapper variant='sm'>
      <Formik initialValues={{ username: '', password: '' }} onSubmit={(values) => console.log(values)}>
        {({ isSubmitting }) => (
          <Form>
            <InputField name="username" placeholder="Username" label="Username" />
            <InputField name="password" placeholder="Password" label="Password" type="password" />
            <Button isLoading={isSubmitting} type="submit" colorScheme="blue" mt={8}>Register</Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
}

export default Register;
