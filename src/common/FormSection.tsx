import { useId, type ReactNode } from 'react';
import { Heading, Text } from '@radix-ui/themes';
import styles from './formSection.module.css';

/** The props of {@link FormSection}. */
export interface FormSectionProps {
  /** The heading of the section, in the narrow leading column. */
  title: string;
  /** A sentence or two under the heading that tells what the fields decide. */
  description?: ReactNode;
  /** The fields, stacked in the wide trailing column. */
  children: ReactNode;
  /** `compact` uses less space around the section, for a list that a person reads and does not fill in. */
  density?: 'compact';
}

/**
 * One section of a settings form: a heading and a description in a narrow leading column, beside the fields in a wider
 * column. A rule divides two sections, and the columns stack below the mobile breakpoint. The layout uses logical
 * properties, so it mirrors in a right-to-left document.
 *
 * @param props - See {@link FormSectionProps}.
 */
export function FormSection({ title, description, children, density }: FormSectionProps) {
  const headingId = useId();

  return (
    <section className={styles.section} data-density={density} aria-labelledby={headingId}>
      <div className={styles.intro}>
        <Heading as="h3" size="3" weight="medium" id={headingId}>
          {title}
        </Heading>
        {description && (
          <Text as="p" size="2" color="gray">
            {description}
          </Text>
        )}
      </div>
      <div className={styles.fields}>{children}</div>
    </section>
  );
}
