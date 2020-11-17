import { Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useRouter } from 'next/router';
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [{}, register] = useRegisterMutation();
  return (
    <Wrapper variant='sm'>
      <Formik initialValues={{ username: '', password: '' }} onSubmit={async (values, {setErrors}) => {
        const response = await register(values);
        if (response.data?.register.errors) setErrors(toErrorMap(response.data.register.errors));
        else if (response.data?.register.user) router.push('/');
      }}>
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
