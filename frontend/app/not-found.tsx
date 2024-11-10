// src/app/not-found/page.tsx
import { Image, Container, Title, Text, Button, SimpleGrid } from '@mantine/core';
import image from 'public/images/NotFound.svg';
import classes from '@/not-found.module.css';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Container className={classes.root}>
            <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
                <Image src={image.src} className={classes.mobileImage} alt="404 Not Found" />
                <div>
                    <Title className={classes.title}>Something is not right...</Title>
                    <Text c="dimmed" size="lg">
                        Page you are trying to open does not exist. You may have mistyped the address, or the
                        page has been moved to another URL. If you think this is an error contact support.
                    </Text>
                    <Button variant="outline" size="md" mt="xl" className={classes.control} component={Link} href="/" >
                        Get back to home page
                    </Button>
                </div>
                <Image src={image.src} className={classes.desktopImage} alt="404 Not Found" />
            </SimpleGrid>
        </Container>
    );
}
